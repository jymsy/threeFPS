import { Scene, Vector3, Clock } from "three";
import {
  Body,
  Vec3,
  Sphere,
  World,
  Material,
  ContactEquation,
} from "cannon-es";
import PointerLockControlsCannon from "./utils/pointerLockControlsCannon";
import Weapon from "./gun";
import { EnemyModel } from "./enemy";

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
  weapon;
  crouch = false; // 下蹲

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
      (Number(this.moveBackward) - Number(this.moveForward)) * factor;
    this.moveVelocity.x =
      (Number(this.moveRight) - Number(this.moveLeft)) * factor;

    this.moveVelocity.applyQuaternion(this.pointerControl.quaternion);

    this.body.velocity.x = this.moveVelocity.x;
    this.body.velocity.z = this.moveVelocity.z;

    this.weapon.render(this.pointerControl, enemyArray, this.moveVelocity);
  }
}

export default Player;
