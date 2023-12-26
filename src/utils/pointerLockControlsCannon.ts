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

class PointerLockControlsCannon extends EventDispatcher {
  yawObject;
  quaternion;
  enabled = false;
  clock = new Clock();
  euler = new Euler();
  firstPerson = true;

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
    this.firstPerson = !this.firstPerson;
    this.yawObject.children[0].translateZ(this.firstPerson ? -0.6 : 0.6);
    this.yawObject.children[0].translateY(this.firstPerson ? -0.1 : 0.1);
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
    this.euler.x -= movementY * 0.002;
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
    return new Vector3(0, 0, -1).applyQuaternion(this.quaternion);
  }

  render(cannonBody: Body) {
    this.yawObject.position.copy(
      new Vector3(
        cannonBody.position.x,
        cannonBody.position.y,
        cannonBody.position.z
      )
    );
  }
}

export default PointerLockControlsCannon;
