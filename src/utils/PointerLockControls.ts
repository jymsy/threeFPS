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
  Object3D,
} from "three";
import { Ray, World, Collider } from "@dimforge/rapier3d-compat";
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
  camera;
  quaternion;
  enabled = false;
  clock = new Clock();
  euler = new Euler();
  offset = new Vector3();
  aimingStartAnimation: Tween<Vector3> | null = null;
  aimingEndAnimation: Tween<Vector3> | null = null;
  eyeRay = new Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
  world;
  cameraOrigin = new Object3D(); // for camera raycast

  constructor(scene: Scene, camera: PerspectiveCamera, world: World) {
    super();

    this.camera = camera;
    this.world = world;
    // const geometry = new BoxGeometry(1, 0.1, 1);
    // const material = new MeshLambertMaterial({
    //   color: 0xff0000,
    // });
    // const box = new Mesh(geometry, material);

    this.euler.order = "YXZ";
    this.cameraGroup.add(camera);
    this.cameraGroup.add(this.cameraOrigin);
    camera.position.copy(CAMERA_INIT_POSITION);
    this.cameraOrigin.position.copy(CAMERA_INIT_POSITION);
    this.quaternion = new Quaternion();

    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("pointerlockchange", this.onPointerlockChange);

    scene.add(this.cameraGroup);
    this.initAimingAnimation();
  }

  initAimingAnimation() {
    const currentPosition = this.camera.position;

    this.aimingStartAnimation = new Tween(currentPosition)
      .to(AIMING_FINAL_POSITION, 200)
      .easing(Easing.Quadratic.Out)
      .onComplete(() => {
        this.cameraOrigin.position.copy(AIMING_FINAL_POSITION);
      });

    this.aimingEndAnimation = new Tween(AIMING_FINAL_POSITION.clone())
      .to(CAMERA_INIT_POSITION, 200)
      .easing(Easing.Quadratic.Out)
      .onUpdate((position) => {
        this.camera.position.copy(position);
      })
      .onComplete(() => {
        this.cameraOrigin.position.copy(CAMERA_INIT_POSITION);
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
      this.camera.position.set(0, 0.33, 0.05);
    } else {
      if (isAiming) {
        this.camera.position.copy(AIMING_FINAL_POSITION);
      } else {
        this.camera.position.set(
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
    return new Vector3(0, 0, 1).applyQuaternion(this.quaternion).normalize();
  }

  calculateSight = (position: Vector3, playerCollider: Collider) => {
    if (!State.firstPerson) {
      const dest = this.cameraOrigin.getWorldPosition(new Vector3());
      const origin = new Vector3(position.x, position.y + 1.2, position.z);
      this.eyeRay.origin = origin;
      this.eyeRay.dir = dest.sub(origin).normalize();

      const hit = this.world.castRay(
        this.eyeRay,
        1.7,
        false,
        undefined,
        undefined,
        playerCollider // ignore player collider
      );
      if (hit !== null) {
        let hitPoint = this.eyeRay.pointAt(hit.toi);
        const newPostion = this.cameraGroup.worldToLocal(
          new Vector3(hitPoint.x, hitPoint.y, hitPoint.z)
        );
        this.camera.position.lerp(
          new Vector3(newPostion.x, newPostion.y, newPostion.z),
          0.1
        );
      } else if (!this.camera.position.equals(this.cameraOrigin.position)) {
        this.camera.position.lerp(this.cameraOrigin.position, 0.1);
      }
    }
  };

  render(position: Vector3, playerCollider: Collider) {
    if (position) {
      this.cameraGroup.position
        .set(position.x, position.y + 0.8, position.z)
        .add(this.offset);
      this.calculateSight(position, playerCollider);
    }
  }
}

export default PointerLockControls;
