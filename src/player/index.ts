import {
  Scene,
  Vector3,
  Clock,
  Euler,
  Mesh,
  AnimationMixer,
  Group,
  AnimationAction,
  LoopOnce,
  SkeletonHelper,
  Bone,
  Object3D,
  MathUtils,
  AnimationClip,
} from "three";
import GUI from "lil-gui";
import {
  Body,
  Vec3,
  Sphere,
  World,
  Material,
  ContactEquation,
} from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import PointerLockControlsCannon from "../utils/pointerLockControlsCannon";
import Weapon from "../weapon";
import { EnemyModel } from "../enemy";
import State from "../state";
import PlayerState, { STATE } from "./State";
import CapsuleCollider from "../utils/CapsuleCollider";

const JUMP_VELOCITY = 3;
const VELOCITY_FACTOR = 2;
const MOVING_FORWARD = 1;
const MOVING_BACKWARD = 2;
const MOVING_LEFT = 4;
const MOVING_RIGHT = 8;

const boneMap = {
  mixamorigLeftArm: "leftArm",
  mixamorigLeftForeArm: "leftForeArm",
  mixamorigLeftShoulder: "leftShoulder",
  mixamorigRightArm: "rightArm",
  mixamorigRightForeArm: "rightForeArm",
  mixamorigRightShoulder: "rightShoulder",
  mixamorigRightHand: "rightHand",
};

const bodyBaseRotation = {
  pistol: {
    leftArm: [1.841, 0.163, 1.439],
    leftForeArm: [0.411, -0.05, -0.166],
    rightArm: [1.131, 0.207, -1.106],
    rightForeArm: [0.905, 0.283, -0.722],
  },
  rifle: {
    leftArm: [1.841, 0.163, 1.439],
    leftForeArm: [0.411, -0.05, -0.166],
    rightArm: [0.961, 0.006, -0.471],
    rightForeArm: [0.905, -0.232, -1.589],
  },
};

class Player {
  body;
  moveBit = 0;
  canJump = false;
  clock = new Clock();
  pointerControl;
  moveVelocity = new Vector3();
  weapon: Weapon;
  crouch = false; // 下蹲
  model?: Group;
  leftArm?: Object3D;
  leftForeArm?: Object3D;
  leftShoulder?: Object3D;
  rightArm?: Object3D;
  rightShoulder?: Object3D;
  rightForeArm?: Object3D;
  rightHand?: Object3D;
  gui = new GUI();
  state?: PlayerState;
  factor = 0;

  constructor(world: World, pointerControl: PointerLockControlsCannon) {
    this.pointerControl = pointerControl;
    const capsule = new CapsuleCollider();
    this.body = capsule.body;
    world.addBody(this.body);

    this.weapon = new Weapon();

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("mouseup", this.handleMouseUp);

    const contactNormal = new Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
    const upAxis = new Vec3(0, 1, 0);

    this.body.addEventListener(
      "collide",
      (event: { contact: ContactEquation }) => {
        const { contact } = event;
        if (contact.bi.id === this.body.id) {
          // bi is the player body, flip the contact normal
          contact.ni.negate(contactNormal);
        } else {
          contactNormal.copy(contact.ni);
        }

        if (contactNormal.dot(upAxis) > 0.5) {
          // Use a "good" threshold value between 0 and 1 here!
          this.canJump = true;
        }
      }
    );
  }

  load(scene: Scene) {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      const bones: Bone[] = [];

      loader.load("gltf/player_pistol.glb", async (gltf) => {
        gltf.scene.scale.set(0.7, 0.7, 0.7);
        // gltf.scene.position.set(0, -0.47, 0);
        const keys = Object.keys(boneMap);
        gltf.scene.traverse((node) => {
          if ((node as Mesh).isMesh) {
            node.castShadow = true;
          }
          if ((node as Bone).isBone) {
            // console.log(node.name);
            if (keys.includes(node.name as keyof typeof boneMap)) {
              bones.push(node as Bone);
              // @ts-ignore
              this[boneMap[node.name]] = node;
            }
          }
        });
        console.log(gltf.animations);
        this.state = new PlayerState(gltf.animations, gltf.scene, this);
        this.model = gltf.scene;
        scene.add(gltf.scene);

        // 骨骼辅助显示
        // const skeletonHelper = new SkeletonHelper(gltf.scene);
        // scene.add(skeletonHelper);

        // this.updateArmRotations("pistol"); // 暂时默认手枪
        // this.leftShoulder!.position.z =23;
        // this.initGui(bones);
        await this.weapon.load(scene);
        this.state.playAnimation(STATE.IDLE);
        resolve(1);
      });
    });
  }

  initGui(bones: Bone[]) {
    for (let i = 0; i < bones.length; i++) {
      const bone = bones[i];

      const folder = this.gui.addFolder("Bone " + bone.name);

      folder.add(
        bone.position,
        "x",
        -100 + bone.position.x,
        100 + bone.position.x
      );
      folder.add(
        bone.position,
        "y",
        -100 + bone.position.y,
        100 + bone.position.y
      );
      folder.add(
        bone.position,
        "z",
        -100 + bone.position.z,
        100 + bone.position.z
      );

      folder.add(bone.rotation, "x", -Math.PI, Math.PI);
      folder.add(bone.rotation, "y", -Math.PI, Math.PI);
      folder.add(bone.rotation, "z", -Math.PI, Math.PI);
      folder.controllers[0].name("position.x");
      folder.controllers[1].name("position.y");
      folder.controllers[2].name("position.z");

      folder.controllers[3].name("rotation.x");
      folder.controllers[4].name("rotation.y");
      folder.controllers[5].name("rotation.z");
    }
  }

  handleMouseDown = (event: MouseEvent) => {
    if (this.pointerControl.enabled) {
      this.weapon.handleMouseDown(event.button);
      if (event.button === 2) {
        this.pointerControl.beginAiming();
      }
    }
  };

  handleMouseUp = (event: MouseEvent) => {
    if (this.pointerControl.enabled) {
      this.weapon.handleMouseUp(event.button);
      if (event.button === 2) {
        this.pointerControl.endAiming();
      }
    }
  };

  updateArmRotations = (type: "pistol" | "rifle") => {
    const rotation = bodyBaseRotation[type];
    this.leftArm?.rotation.set(
      rotation.leftArm[0],
      rotation.leftArm[1],
      rotation.leftArm[2]
    );
    this.leftForeArm?.rotation.set(
      rotation.leftForeArm[0],
      rotation.leftForeArm[1],
      rotation.leftForeArm[2]
    );
    this.rightArm?.rotation.set(
      rotation.rightArm[0],
      rotation.rightArm[1],
      rotation.rightArm[2]
    );
    this.rightForeArm?.rotation.set(
      rotation.rightForeArm[0],
      rotation.rightForeArm[1],
      rotation.rightForeArm[2]
    );
  };

  onKeyDown = (event: KeyboardEvent) => {
    if (!this.pointerControl.enabled) {
      return;
    }
    switch (event.key) {
      case "w":
        this.moveBit |= MOVING_FORWARD;
        break;
      case "s":
        this.moveBit |= MOVING_BACKWARD;
        break;
      case "a":
        this.moveBit |= MOVING_LEFT;
        break;
      case "d":
        this.moveBit |= MOVING_RIGHT;
        break;
      case " ":
        if (this.canJump) {
          this.body.velocity.y = JUMP_VELOCITY;
          this.canJump = false;
          this.state?.playAnimation(STATE.JUMP);
        }
        break;
      case "v":
        this.pointerControl.changeView();
        break;
      // case "c":
      //   this.crouch = true;
      //   this.pointerControl.setOffset(new Vector3(0, -0.2, 0));
      //   break;
      case "1":
      case "2":
        this.weapon.switchWeapon(Number(event.key));
      // this.updateArmRotations(
      //   this.weapon.loader.weapons[this.weapon.currentIndex].config.type
      // );
      default:
        break;
    }

    this.playAnimation();
  };

  playAnimation() {
    switch (this.moveBit) {
      case MOVING_FORWARD:
      case MOVING_FORWARD | MOVING_LEFT:
      case MOVING_FORWARD | MOVING_RIGHT:
      case MOVING_FORWARD | MOVING_LEFT | MOVING_RIGHT:
        this.state?.playAnimation(STATE.RUN);
        break;
      case MOVING_BACKWARD:
      case MOVING_BACKWARD | MOVING_LEFT:
      case MOVING_BACKWARD | MOVING_RIGHT:
      case MOVING_BACKWARD | MOVING_LEFT | MOVING_RIGHT:
        this.state?.playAnimation(STATE.BACK);
        break;
      case MOVING_LEFT:
      case MOVING_LEFT | MOVING_FORWARD | MOVING_BACKWARD:
        this.state?.playAnimation(STATE.LEFT);
        break;
      case MOVING_RIGHT:
      case MOVING_RIGHT | MOVING_FORWARD | MOVING_BACKWARD:
        this.state?.playAnimation(STATE.RIGHT);
        break;
      default:
        this.state?.playAnimation(STATE.IDLE);
    }
  }

  onKeyUp = (event: KeyboardEvent) => {
    if (!this.pointerControl.enabled) {
      return;
    }
    switch (event.key) {
      case "w":
        this.moveBit ^= MOVING_FORWARD;
        break;
      case "a":
        this.moveBit ^= MOVING_LEFT;
        break;
      case "s":
        this.moveBit ^= MOVING_BACKWARD;
        break;
      case "d":
        this.moveBit ^= MOVING_RIGHT;
        break;
    }
    this.playAnimation();
  };

  render(enemyArray: EnemyModel[]) {
    const delta = this.clock.getDelta();
    this.factor = VELOCITY_FACTOR * delta * 100;

    this.moveVelocity.z =
      ((this.moveBit & MOVING_FORWARD) - ((this.moveBit >> 1) & 1)) *
      this.factor;
    this.moveVelocity.x =
      (((this.moveBit >> 2) & 1) - ((this.moveBit >> 3) & 1)) * this.factor;

    this.moveVelocity.applyEuler(new Euler(0, this.pointerControl.euler.y, 0));

    this.body.velocity.x = this.moveVelocity.x;
    this.body.velocity.z = this.moveVelocity.z;

    if (this.model) {
      this.model.position.set(
        this.body.position.x,
        this.body.position.y - 0.1,
        this.body.position.z
      );
      this.model.rotation.y = this.pointerControl.euler.y;
      // this.leftShoulder!.rotation.x = this.pointerControl.euler.x + 1.5;
      // this.rightShoulder!.rotation.x = this.pointerControl.euler.x + 1.5;

      // const { x, y, z } = this.pointerControl.yawObject.position;
      // this.leftShoulder?.position.copy(this.pointerControl.yawObject.position);
      // this.leftShoulder?.position.copy(
      //   new Vector3(x, y, z)
      // );
    }

    this.state?.mixer.update(delta);

    const handPosition = new Vector3();
    this.rightHand?.getWorldPosition(handPosition);
    this.weapon.render(
      this.pointerControl,
      enemyArray,
      this.moveVelocity,
      handPosition
    );
  }
}

export default Player;
