import {
  EventDispatcher,
  PerspectiveCamera,
  Group,
  Quaternion,
  Clock,
  Vector3,
  Euler,
} from "three";
import {
  Body,
  Vec3,
  Sphere,
  World,
  Material,
  Plane,
  ContactMaterial,
} from "cannon-es";

class PointerLockControlsCannon extends EventDispatcher {
  cannonBody;
  pitchObject;
  yawObject;
  quaternion;
  moveForward;
  moveBackward;
  moveLeft;
  moveRight;
  canJump;
  enabled = false;
  jumpVelocity = 20;
  velocity;
  clock = new Clock();
  velocityFactor = 0.4;
  euler = new Euler();

  constructor(camera: PerspectiveCamera, cannonBody: Body) {
    super();

    this.cannonBody = cannonBody;
    this.velocity = this.cannonBody.velocity;
    this.pitchObject = new Group();
    this.pitchObject.add(camera);

    this.yawObject = new Group();
    // this.yawObject.position.y = 0;
    this.yawObject.add(this.pitchObject);

    this.quaternion = new Quaternion();

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.canJump = false;

    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("pointerlockchange", this.onPointerlockChange);
    // document.addEventListener("pointerlockerror", this.onPointerlockError);
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
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

    this.yawObject.rotation.y -= movementX * 0.002;
    this.pitchObject.rotation.x -= movementY * 0.002;

    this.pitchObject.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.pitchObject.rotation.x)
    );
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

  onKeyDown = (event: KeyboardEvent) => {
    if (!this.enabled) {
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
        // if (!this.jumping && this.spaceUp) {
        //   this.velocity.y += 15;
        //   this.jumping = true;
        //   this.spaceUp = false;
        // }
        if (this.canJump) {
          this.velocity.y = this.jumpVelocity;
          this.canJump = false;
        }

        break;
      default:
        break;
    }
  };

  onKeyUp = (event: KeyboardEvent) => {
    if (!this.enabled) {
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
      // case " ":
      //   this.spaceUp = true;
    }
  };

  getObject() {
    return this.yawObject;
  }

  getDirection() {
    return new Vector3(0, 0, -1).applyQuaternion(this.quaternion);
  }

  render() {
    if (this.enabled === false) {
      return;
    }
    const delta = this.clock.getDelta();
    const inputVelocity = new Vector3();

    if (this.moveForward) {
      inputVelocity.z = -this.velocityFactor * delta * 100;
    }
    if (this.moveBackward) {
      inputVelocity.z = this.velocityFactor * delta * 100;
    }

    if (this.moveLeft) {
      inputVelocity.x = -this.velocityFactor * delta * 100;
    }
    if (this.moveRight) {
      inputVelocity.x = this.velocityFactor * delta * 100;
    }

    this.euler.x = this.pitchObject.rotation.x;
    this.euler.y = this.yawObject.rotation.y;
    this.quaternion.setFromEuler(this.euler);
    inputVelocity.applyQuaternion(this.quaternion);

    // Add to the object
    this.velocity.x = inputVelocity.x;
    this.velocity.z = inputVelocity.z;

    this.yawObject.position.copy(
      new Vector3(
        this.cannonBody.position.x,
        this.cannonBody.position.y,
        this.cannonBody.position.z
      )
    );
  }
}

export default PointerLockControlsCannon;
