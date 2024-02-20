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
  Raycaster,
  AnimationClip,
  Quaternion,
} from "three";
import GUI from "lil-gui";
import { World } from "@dimforge/rapier3d-compat";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import PointerLockControls from "../utils/PointerLockControls";
import Weapon from "../weapon";
import { EnemyModel } from "../enemy";
import State from "../state";
import PlayerState, { STATE } from "./State";
import CapsuleCollider from "../utils/CapsuleCollider";

const JUMP_VELOCITY = 0.11;
const VELOCITY_FACTOR = 4;
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
  collider;
  moveBit = 0;
  canJump = false;
  clock = new Clock();
  pointerControl;
  moveVelocity = new Vector3(0, -0.1, 0);
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
  scene;
  rayHit = false;
  rayCaster;
  delta = 0;

  constructor(world: World, pointerControl: PointerLockControls, scene: Scene) {
    this.scene = scene;
    this.pointerControl = pointerControl;
    this.collider = new CapsuleCollider(world);

    this.weapon = new Weapon(scene, pointerControl);

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("mouseup", this.handleMouseUp);

    this.rayCaster = new Raycaster(
      new Vector3(),
      new Vector3(0, -1, 0),
      0,
      0.64
    );
  }

  load() {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      const bones: Bone[] = [];

      loader.load("gltf/riflePlayer.glb", async (gltf) => {
        gltf.scene.scale.set(0.7, 0.7, 0.7);
        // gltf.scene.position.set(0, -0.47, 0);
        const keys = Object.keys(boneMap);
        gltf.scene.traverse((node) => {
          if ((node as Mesh).isMesh) {
            node.castShadow = true;
          }
          if ((node as Bone).isBone) {
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
        this.scene.add(gltf.scene);

        // 骨骼辅助显示
        // const skeletonHelper = new SkeletonHelper(gltf.scene);
        // scene.add(skeletonHelper);

        // this.updateArmRotations("pistol"); // 暂时默认手枪
        // this.leftShoulder!.position.z =23;
        // this.initGui(bones);
        await this.weapon.load();
        this.state.playAnimation(STATE.IDLE);

        resolve(1);
      });

      // loader.load("gltf/animated_assault_rifle.glb", (glb) => {
      //   const mesh = glb.scene.children[0];
      //   // console.log(mesh);
      //   mesh.scale.set(0.05, 0.05, 0.05);
      //   console.log(mesh);
      //   // glb.scene.scale.set(0.1, 0.1, 0.1);
      //   mesh.traverse((node) => {
      //     if (
      //       [
      //         "BARREL",
      //         "crosshair",
      //         "sleeve",
      //         "hardknuckle",
      //         "shape_pose",
      //       ].includes(node.name)
      //     ) {
      //       node.visible = false;
      //     }
      //     if ((node as Mesh).isMesh) {
      //       node.castShadow = true;
      //     }
      //   });
      //   console.log(glb.animations);
      //   this.scene.add(mesh);
      // });
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
      if (event.button === 2) {
        this.weapon.beginAiming();
        this.state?.playAnimation(STATE.AIM);
        this.pointerControl.beginAiming();
      } else if (event.button === 0 && this.weapon.isAiming) {
        this.weapon.beginShooting();
        this.state?.playAnimation(STATE.SHOOT);
      }
    }
  };

  handleMouseUp = (event: MouseEvent) => {
    if (this.pointerControl.enabled) {
      if (event.button === 2) {
        this.weapon.endAiming();
        this.state?.playAnimation(STATE.IDLE);
        this.pointerControl.endAiming();
        if (this.weapon.isShooting) {
          this.weapon.endShooting();
        }
      } else if (event.button === 0 && this.weapon.isAiming) {
        this.weapon.endShooting();
        this.state?.playAnimation(STATE.AIM);
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
        if (this.rayHit) {
          this.moveVelocity.y = JUMP_VELOCITY;
          this.state?.playAnimation(STATE.JUMP);
        }
        return;
      case "v":
        this.pointerControl.changeView();
        break;
      case "r":
        this.weapon.reload();
        return;
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
      case MOVING_FORWARD | MOVING_LEFT:
        this.state?.playAnimation(STATE.FORWARD_LEFT);
        break;
      case MOVING_FORWARD | MOVING_RIGHT:
        this.state?.playAnimation(STATE.FORWARD_RIGHT);
        break;
      case MOVING_FORWARD:
      case MOVING_FORWARD | MOVING_LEFT | MOVING_RIGHT:
        this.state?.playAnimation(STATE.FORWARD);
        break;
      case MOVING_BACKWARD:
      case MOVING_BACKWARD | MOVING_LEFT | MOVING_RIGHT:
        this.state?.playAnimation(STATE.BACKWARD);
        break;
      case MOVING_BACKWARD | MOVING_LEFT:
        this.state?.playAnimation(STATE.BACKWARD_LEFT);
        break;
      case MOVING_BACKWARD | MOVING_RIGHT:
        this.state?.playAnimation(STATE.BACKWARD_RIGHT);
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
      default:
        return;
    }
    this.playAnimation();
  };

  isHitTheGround = (x: number, y: number, z: number) => {
    this.rayCaster.ray.origin = new Vector3(x, y, z);
    const intersections = this.rayCaster.intersectObjects(
      State.worldMapMeshes,
      false
    );
    this.rayHit = intersections.length > 0;

    return this.rayHit;
  };

  render(enemyArray: EnemyModel[]) {
    this.delta = this.clock.getDelta();
    this.factor = VELOCITY_FACTOR * this.delta;

    this.moveVelocity.z =
      ((this.moveBit & MOVING_FORWARD) - ((this.moveBit >> 1) & 1)) *
      this.factor;
    this.moveVelocity.x =
      (((this.moveBit >> 2) & 1) - ((this.moveBit >> 3) & 1)) * this.factor;
    this.moveVelocity.y -= 9.8 * this.factor * 0.01;
    this.moveVelocity.applyEuler(new Euler(0, this.pointerControl.euler.y, 0));

    this.collider.controller.computeColliderMovement(
      this.collider.collider,
      this.moveVelocity
    );

    let movement = this.collider.controller.computedMovement();
    let newPos = this.collider.body.translation();
    newPos.x += movement.x;
    newPos.y += movement.y;
    newPos.z += movement.z;
    this.collider.body.setNextKinematicTranslation(newPos);

    if (this.isHitTheGround(newPos.x, newPos.y, newPos.z)) {
      this.moveVelocity.y = Math.max(0, this.moveVelocity.y);
      this.playAnimation();
    }

    if (this.model) {
      this.model.position.set(newPos.x, newPos.y - 0.6, newPos.z);
      this.model.rotation.y = this.pointerControl.euler.y;
    }

    this.state?.mixer.update(this.delta);
    this.weapon.render(
      this.pointerControl,
      enemyArray,
      this.moveVelocity,
      this.rightHand!
    );
  }
}

export default Player;
