import {
  EventDispatcher,
  PerspectiveCamera,
  Group,
  Quaternion,
  Clock,
  Vector3,
  Euler,
  Scene,
} from "three";
import { Body } from "cannon-es";
import State from "../state";

class PointerLockControlsCannon extends EventDispatcher {
  yawObject;
  quaternion;
  enabled = false;
  clock = new Clock();
  euler = new Euler();
  // firstPerson = true;
  offset = new Vector3();

  constructor(scene: Scene, camera: PerspectiveCamera) {
    super();
    this.euler.order = "YXZ";
    this.yawObject = new Group();
    this.yawObject.add(camera);
    this.quaternion = new Quaternion();

    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("pointerlockchange", this.onPointerlockChange);

    scene.add(this.yawObject);
  }

  changeView() {
    State.firstPerson = !State.firstPerson;
    // moving camera
    this.yawObject.children[0].translateZ(State.firstPerson ? -2 : 2);
    this.yawObject.children[0].translateY(State.firstPerson ? -0.2 : 0.2);
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

    this.yawObject.setRotationFromEuler(this.euler);
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
    return this.yawObject;
  }

  getDirection() {
    return new Vector3(0, 0, 1).applyQuaternion(this.quaternion);
  }

  render(cannonBody: Body) {
    this.yawObject.position
      .set(
        cannonBody.position.x,
        cannonBody.position.y + 0.8,
        cannonBody.position.z
      )
      .add(this.offset);
  }
}

export default PointerLockControlsCannon;
