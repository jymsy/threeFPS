import {
  EventDispatcher,
  PerspectiveCamera,
  Group,
  Quaternion,
  Clock,
  Vector3,
  Euler,
  Scene,
  BoxGeometry,
  MeshLambertMaterial,
  Mesh,
} from "three";
import { Tween, Easing } from "@tweenjs/tween.js";
import State from "../state";

const CAMERA_INIT_POSITION = new Vector3(-0.15, 0.5, -1.5);
const AIMING_FINAL_POSITION = new Vector3(
  CAMERA_INIT_POSITION.x - 0.3,
  CAMERA_INIT_POSITION.y - 0.1,
  CAMERA_INIT_POSITION.z + 0.7
);

class PointerLockControls extends EventDispatcher {
  cameraGroup = new Group();
  quaternion;
  enabled = false;
  clock = new Clock();
  euler = new Euler();
  offset = new Vector3();
  aimingStartAnimation: Tween<Vector3> | null = null;
  aimingEndAnimation: Tween<Vector3> | null = null;

  constructor(scene: Scene, camera: PerspectiveCamera) {
    super();

    // const geometry = new BoxGeometry(1, 0.1, 1);
    // const material = new MeshLambertMaterial({
    //   color: 0xff0000,
    // });
    // const box = new Mesh(geometry, material);

    this.euler.order = "YXZ";
    this.cameraGroup.add(camera);
    // this.cameraGroup.add(box);
    camera.position.copy(CAMERA_INIT_POSITION);
    this.quaternion = new Quaternion();

    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("pointerlockchange", this.onPointerlockChange);

    scene.add(this.cameraGroup);
    this.initAimingAnimation();
  }

  initAimingAnimation() {
    const currentPosition = this.cameraGroup.children[0].position;

    this.aimingStartAnimation = new Tween(currentPosition)
      .to(AIMING_FINAL_POSITION, 200)
      .easing(Easing.Quadratic.Out);

    this.aimingEndAnimation = new Tween(AIMING_FINAL_POSITION.clone())
      .to(CAMERA_INIT_POSITION, 200)
      .easing(Easing.Quadratic.Out)
      .onUpdate((position) => {
        this.cameraGroup.children[0].position.copy(position);
      });
  }

  beginAiming() {
    if (!State.firstPerson) {
      this.aimingStartAnimation?.start();
    }
  }

  endAiming() {
    if (!State.firstPerson) {
      this.aimingEndAnimation?.start();
    }
  }

  changeView(isAiming: boolean) {
    // moving camera
    if (State.firstPerson) {
      this.cameraGroup.children[0].position.set(0, 0.33, 0.05);
    } else {
      if (isAiming) {
        this.cameraGroup.children[0].position.copy(AIMING_FINAL_POSITION);
      } else {
        this.cameraGroup.children[0].position.set(
          CAMERA_INIT_POSITION.x,
          CAMERA_INIT_POSITION.y,
          CAMERA_INIT_POSITION.z
        );
      }
    }
  }

  setOffset(offset: Vector3) {
    this.offset = offset;
  }

  lock() {
    document.body.requestPointerLock();
  }

  unlock() {
    document.exitPointerLock();
  }

  onMouseMove = (event: MouseEvent) => {
    if (!this.enabled) {
      return;
    }

    const { movementX, movementY } = event;

    this.euler.y -= movementX * 0.002;
    this.euler.x += movementY * 0.002;
    this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

    this.cameraGroup.setRotationFromEuler(this.euler);
    this.quaternion.setFromEuler(this.euler);
  };

  onPointerlockChange = () => {
    if (document.pointerLockElement) {
      this.dispatchEvent({ type: "lock" });
      this.enabled = true;
    } else {
      this.dispatchEvent({ type: "unlock" });
      this.enabled = false;
    }
  };

  getObject() {
    return this.cameraGroup;
  }

  getDirection() {
    return new Vector3(0, 0, 1).applyQuaternion(this.quaternion);
  }

  render(position?: Vector3) {
    if (position) {
      this.cameraGroup.position
        .set(position.x, position.y + 0.8, position.z)
        .add(this.offset);
    }
  }
}

export default PointerLockControls;
