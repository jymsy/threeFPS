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
import PointerLockControlsCannon from "./utils/pointerLockControlsCannon";
import Weapon from "./weapon";
import { EnemyModel } from "./enemy";
import State from "./state";

const JUMP_VELOCITY = 3;
const VELOCITY_FACTOR = 0.4;

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
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
  canJump = false;
  speed = 10; //控制器移动速度
  clock = new Clock();
  spaceUp = true;
  pointerControl;
  moveVelocity = new Vector3();
  weapon;
  crouch = false; // 下蹲
  model?: Group;
  mixer?: AnimationMixer;
  walkingAction?: AnimationAction;
  leftArm?: Object3D;
  leftForeArm?: Object3D;
  leftShoulder?: Object3D;
  rightArm?: Object3D;
  rightShoulder?: Object3D;
  rightForeArm?: Object3D;
  rightHand?: Object3D;
  gui = new GUI();

  constructor(
    world: World,
    material: Material,
    pointerControl: PointerLockControlsCannon,
    scene: Scene
  ) {
    this.pointerControl = pointerControl;
    this.weapon = new Weapon(scene);
    const shape = new Sphere(0.15);
    this.body = new Body({
      mass: 2,
      // 碰撞体的三维空间中位置
      position: new Vec3(0, 20, 0),
      fixedRotation: true,
      // linearDamping: 0.9,
      material: material,
    });
    // this.body.updateMassProperties();
    // 两个圆球，组成胶囊形状
    this.body.addShape(shape, new Vec3(0, 0, 0));
    // this.body.addShape(shape, new Vec3(8, 0.25, 3));

    world.addBody(this.body);

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
    const loader = new GLTFLoader();
    const bones: Bone[] = [];
    loader.load("gltf/player.glb", (gltf) => {
      gltf.scene.scale.set(0.3, 0.3, 0.3);
      gltf.scene.position.set(0, -0.47, 0);
      const keys = Object.keys(boneMap);
      gltf.scene.traverse((node) => {
        if ((node as Mesh).isMesh) {
          node.castShadow = true;
        }
        if ((node as Bone).isBone) {
          console.log(node.name);
          if (keys.includes(node.name as keyof typeof boneMap)) {
            bones.push(node as Bone);
            // @ts-ignore
            this[boneMap[node.name]] = node;
          }
        }
      });

      this.model = gltf.scene;
      scene.add(gltf.scene);

      // 骨骼辅助显示
      const skeletonHelper = new SkeletonHelper(gltf.scene);
      scene.add(skeletonHelper);

      console.log(gltf);
      this.mixer = new AnimationMixer(gltf.scene);
      const walking = gltf.animations[3];
      this.walkingAction = this.mixer.clipAction(walking);
      // this.walkingAction.play();

      this.updateArmRotations("pistol"); // 暂时默认手枪
      this.initGui(bones);
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
        -10 + bone.position.y,
        10 + bone.position.y
      );
      folder.add(
        bone.position,
        "z",
        -10 + bone.position.z,
        10 + bone.position.z
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
    }
  };

  handleMouseUp = (event: MouseEvent) => {
    if (this.pointerControl.enabled) {
      this.weapon.handleMouseUp(event.button);
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
        this.moveForward = true;
        break;
      case "s":
        this.moveBackward = true;
        break;
      case "a":
        this.moveLeft = true;
        break;
      case "d":
        this.moveRight = true;
        break;
      case " ":
        if (this.canJump) {
          this.body.velocity.y = JUMP_VELOCITY;
          this.canJump = false;
        }
        break;
      case "v":
        this.pointerControl.changeView();
        break;
      case "c":
        this.crouch = true;
        this.pointerControl.setOffset(new Vector3(0, -0.2, 0));
        break;
      case "1":
      case "2":
        this.weapon.switchWeapon(Number(event.key));
        this.updateArmRotations(
          this.weapon.loader.weapons[this.weapon.currentIndex].config.type
        );
      default:
        break;
    }
  };

  onKeyUp = (event: KeyboardEvent) => {
    if (!this.pointerControl.enabled) {
      return;
    }
    switch (event.key) {
      case "w":
        this.moveForward = false;
        break;
      case "a":
        this.moveLeft = false;
        break;
      case "s":
        this.moveBackward = false;
        break;
      case "d":
        this.moveRight = false;
        break;
      case "c":
        this.crouch = false;
        this.pointerControl.setOffset(new Vector3(0, 0, 0));
        break;
    }
  };

  render(enemyArray: EnemyModel[]) {
    const delta = this.clock.getDelta();
    const factor = VELOCITY_FACTOR * delta * 100;
    this.moveVelocity = new Vector3();

    this.moveVelocity.z =
      (Number(this.moveForward) - Number(this.moveBackward)) * factor;
    this.moveVelocity.x =
      (Number(this.moveLeft) - Number(this.moveRight)) * factor;

    this.moveVelocity.applyEuler(new Euler(0, this.pointerControl.euler.y, 0));

    this.body.velocity.x = this.moveVelocity.x;
    this.body.velocity.z = this.moveVelocity.z;

    if (this.model) {
      this.model.position.set(
        this.body.position.x,
        this.body.position.y - 0.37,
        this.body.position.z
      );
      // this.model.rotation.y = this.pointerControl.euler.y;

      this.leftShoulder!.rotation.x = this.pointerControl.euler.x + 1.5;
      this.rightShoulder!.rotation.x = this.pointerControl.euler.x + 1.5;
      // const { x, y, z } = this.pointerControl.yawObject.position;
      // this.leftShoulder?.position.copy(this.pointerControl.yawObject.position);
      // this.leftShoulder?.position.copy(
      //   new Vector3(x, y, z)
      // );
    }

    this.mixer?.update(delta);

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
