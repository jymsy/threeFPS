import {
  Scene,
  Vector3,
  Clock,
  Euler,
  Group,
  AxesHelper,
  Bone,
  Object3D,
  Raycaster,
  Quaternion,
} from "three";
import GUI from "lil-gui";
import { World } from "@dimforge/rapier3d-compat";
import PointerLockControls from "../utils/PointerLockControls";
import Weapon from "../weapon";
import { EnemyModel } from "../enemy";
import State from "../state";
import PlayerState, { STATE } from "./State";
import CapsuleCollider from "../utils/CapsuleCollider";
import ModelLoader from "./ModelLoader";

const JUMP_VELOCITY = 0.11;
const VELOCITY_FACTOR = 4;
const MOVING_FORWARD = 1;
const MOVING_BACKWARD = 2;
const MOVING_LEFT = 4;
const MOVING_RIGHT = 8;

class Player {
  collider;
  moveBit = 0;
  canJump = false;
  clock = new Clock();
  pointerControl;
  moveVelocity = new Vector3(0, -0.1, 0);
  weapon: Weapon;
  crouch = false; // 下蹲
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
  modelLoader;
  spine?: Object3D;

  constructor(world: World, pointerControl: PointerLockControls, scene: Scene) {
    this.scene = scene;
    this.pointerControl = pointerControl;
    this.collider = new CapsuleCollider(world);

    this.weapon = new Weapon(scene, pointerControl);
    this.modelLoader = new ModelLoader(scene);

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
    return new Promise(async (resolve) => {
      const { model, animations } = await this.modelLoader.load(
        "third-view",
        "gltf/rifle.glb",
        0.7,
        (node) => {
          if ((node as Bone).isBone) {
            // console.log(node);
            if (node.name === "mixamorigRightHand") {
              this.rightHand = node;
            } else if (node.name === "mixamorigSpine") {
              this.spine = node;
              // const axesHelper = new AxesHelper(150);
              // this.spine.add(axesHelper);
            }
          }
        }
      );

      console.log(animations);
      this.modelLoader.use("third-view");
      this.state = new PlayerState(
        animations,
        model,
        ["jump"],
        (name: string) => {
          if (name === "jump") {
            this.playAnimation();
          }
        }
      );
      await this.weapon.load();
      this.state.playAnimation(STATE.AIM);
      // this.initGui([this.spine as Bone]);

      resolve(1);
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
        this.pointerControl.beginAiming();
      } else if (event.button === 0) {
        this.weapon.beginShooting();
        this.state?.playAnimation(
          this.state?.currentState.name === STATE.FORWARD
            ? STATE.FORWARD_SHOOT
            : STATE.SHOOT
        );
      }
    }
  };

  handleMouseUp = (event: MouseEvent) => {
    if (this.pointerControl.enabled) {
      if (event.button === 2) {
        this.weapon.endAiming();
        this.pointerControl.endAiming();
        if (this.weapon.isShooting) {
          this.weapon.endShooting();
        }
      } else if (event.button === 0) {
        this.weapon.endShooting();
        // this.state?.playAnimation(STATE.AIM);
        this.playAnimation();
      }
    }
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
        this.changeView();
        return;
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
        return;
      // this.updateArmRotations(
      //   this.weapon.loader.weapons[this.weapon.currentIndex].config.type
      // );
      default:
        break;
    }

    this.playAnimation();
  };

  changeView = () => {
    State.firstPerson = !State.firstPerson;
    this.pointerControl.changeView(this.weapon.isAiming);
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
        this.state?.playAnimation(STATE.BACKWARD_AIM);
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
        this.state?.playAnimation(STATE.AIM);
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

    this.state?.mixer.update(this.delta);
    // update move velocity vector
    this.moveVelocity.z =
      ((this.moveBit & MOVING_FORWARD) - ((this.moveBit >> 1) & 1)) *
      this.factor;
    this.moveVelocity.x =
      (((this.moveBit >> 2) & 1) - ((this.moveBit >> 3) & 1)) * this.factor;
    this.moveVelocity.y -= 9.8 * this.factor * 0.01;
    this.moveVelocity.applyEuler(new Euler(0, this.pointerControl.euler.y, 0));

    // update body position
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
    }

    // update model position
    const model = this.modelLoader.getCurrentModel();
    if (model) {
      model.position.set(newPos.x, newPos.y - 0.6, newPos.z);
      model.rotation.y = this.pointerControl.euler.y;

      const axis = new Vector3(1, 0, 0).applyEuler(
        new Euler(0, this.pointerControl.euler.y, 0)
      );
      // this.spine!.updateWorldMatrix(true, true);
      const invWorldQuaternion = this.spine!.getWorldQuaternion(
        new Quaternion()
      ).invert();
      axis.applyQuaternion(invWorldQuaternion);

      let deltaLocalQuaternion = new Quaternion();
      deltaLocalQuaternion.setFromAxisAngle(axis, this.pointerControl.euler.x);
      this.spine!.quaternion.multiply(deltaLocalQuaternion);
    }

    this.weapon.render(
      this.pointerControl,
      enemyArray,
      this.moveVelocity,
      this.rightHand!
    );

    this.pointerControl.render(model.position, this.collider.collider);
  }
}

export default Player;
