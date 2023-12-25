import {
  Scene,
  SphereGeometry,
  MeshLambertMaterial,
  Mesh,
  Vector3,
  Clock,
} from "three";
import {
  Body,
  Vec3,
  Sphere,
  World,
  Material,
  Plane,
  ContactMaterial,
  ContactEquation,
} from "cannon-es";
import PointerLockControlsCannon from "./utils/pointerLockControlsCannon";

const JUMP_VELOCITY = 3;
const VELOCITY_FACTOR = 0.4;

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

  constructor(
    world: World,
    material: Material,
    pointerControl: PointerLockControlsCannon
  ) {
    this.pointerControl = pointerControl;
    const shape = new Sphere(0.15);
    this.body = new Body({
      mass: 3,
      // 碰撞体的三维空间中位置
      position: new Vec3(0, 0, 0),
      fixedRotation: true,
      // linearDamping: 0.9,
      material: material,
    });
    // this.body.updateMassProperties();
    // 两个圆球，组成胶囊形状
    this.body.addShape(shape, new Vec3(0, -0.25, 0));
    this.body.addShape(shape, new Vec3(0, 0.25, 0));

    world.addBody(this.body);

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);

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
    }
  };

  render() {
    const delta = this.clock.getDelta();
    this.moveVelocity = new Vector3();

    if (this.moveForward) {
      this.moveVelocity.z = -VELOCITY_FACTOR * delta * 100;
    }
    if (this.moveBackward) {
      this.moveVelocity.z = VELOCITY_FACTOR * delta * 100;
    }

    if (this.moveLeft) {
      this.moveVelocity.x = -VELOCITY_FACTOR * delta * 100;
    }
    if (this.moveRight) {
      this.moveVelocity.x = VELOCITY_FACTOR * delta * 100;
    }

    this.moveVelocity.applyQuaternion(this.pointerControl.quaternion);

    this.body.velocity.x = this.moveVelocity.x;
    this.body.velocity.z = this.moveVelocity.z;
  }
}

export default Player;
