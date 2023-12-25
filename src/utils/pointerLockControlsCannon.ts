import {
  EventDispatcher,
  PerspectiveCamera,
  Group,
  Quaternion,
  Clock,
  Vector3,
  Euler,
} from "three";
import { Body } from "cannon-es";

class PointerLockControlsCannon extends EventDispatcher {
  // cannonBody;
  // pitchObject;
  yawObject;
  quaternion;
  // moveForward;
  // moveBackward;
  // moveLeft;
  // moveRight;
  // canJump;
  enabled = false;
  // jumpVelocity = 3;
  // velocity;
  clock = new Clock();
  // velocityFactor = 0.4;
  euler = new Euler();
  moveVelocity = new Vector3();
  firstPerson = true;

  constructor(camera: PerspectiveCamera) {
    super();

    // this.velocity = this.cannonBody.velocity;
    // this.pitchObject = new Group();
    // this.pitchObject.add(camera);

    this.euler.order = "YXZ";
    this.yawObject = new Group();
    this.yawObject.add(camera);

    this.quaternion = new Quaternion();

    // this.moveForward = false;
    // this.moveBackward = false;
    // this.moveLeft = false;
    // this.moveRight = false;

    // this.canJump = false;

    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("pointerlockchange", this.onPointerlockChange);
  }

  changeView() {
    this.firstPerson = !this.firstPerson;
    this.yawObject.children[0].translateZ(this.firstPerson ? -0.5 : 0.5);
    this.yawObject.children[0].translateY(this.firstPerson ? -0.2 : 0.2);
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
    // this.yawObject.rotation.y -= movementX * 0.002;
    // this.pitchObject.rotation.x -= movementY * 0.002;

    // this.pitchObject.rotation.x = Math.max(
    //   -Math.PI / 2,
    //   Math.min(Math.PI / 2, this.pitchObject.rotation.x)
    // );
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
    // const delta = this.clock.getDelta();
    // this.moveVelocity = new Vector3();

    // if (this.moveForward) {
    //   this.moveVelocity.z = -this.velocityFactor * delta * 100;
    // }
    // if (this.moveBackward) {
    //   this.moveVelocity.z = this.velocityFactor * delta * 100;
    // }

    // if (this.moveLeft) {
    //   this.moveVelocity.x = -this.velocityFactor * delta * 100;
    // }
    // if (this.moveRight) {
    //   this.moveVelocity.x = this.velocityFactor * delta * 100;
    // }

    // // this.euler.x = this.pitchObject.rotation.x;
    // // this.euler.y = this.yawObject.rotation.y;

    // this.moveVelocity.applyQuaternion(this.quaternion);

    // // Add to the object
    // this.velocity.x = this.moveVelocity.x;
    // this.velocity.z = this.moveVelocity.z;

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
