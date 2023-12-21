import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import {
  Scene,
  Vector3,
  Group,
  PlaneGeometry,
  TextureLoader,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  Vector2,
} from "three";
import { Tween, Easing } from "@tweenjs/tween.js";
import Camera from "./camera";
import Enemy from "./enemy";
import PointerLockControlsCannon from "./utils/pointerLockControlsCannon";

class Gun {
  gltf: GLTF | null = null;
  group;
  swayingGroup;
  swayingAnimationFinished = true;
  swayingAnimation: Tween<Vector3> | null = null;
  isShooting = false;
  recoilGroup;
  recoilAnimation: Tween<{
    x: number;
    y: number;
    z: number;
    rotation: number;
  }> | null = null;
  recoilAnimationFinished = true;
  swayingNewPosition = new Vector3(-0.005, 0.005, 0);
  swayingDuration = 1000;
  isMoving = false;
  isAiming = false;
  aimingStartAnimation: Tween<Vector3> | null = null;
  aimingEndAnimation: Tween<Vector3> | null = null;
  flashAnimation: Tween<{ opacity: number }> | null = null;
  flashMesh;
  audio;
  enemy;

  constructor(scene: Scene, enemy: Enemy) {
    this.enemy = enemy;
    this.audio = new Audio("./audio/single-shoot-ak47.wav");
    // 创建GLTF加载器对象
    const loader = new GLTFLoader();
    this.group = new Group();
    this.swayingGroup = new Group();
    this.recoilGroup = new Group();

    const geometry = new PlaneGeometry(0.2, 0.2);
    const texLoader = new TextureLoader();
    const texture = texLoader.load("./img/flash_shoot.png");
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
    });

    this.flashMesh = new Mesh(geometry, material);
    this.flashMesh.position.set(-0.1, -0.27, 0.35);
    this.flashMesh.rotateY(Math.PI);

    loader.load("gltf/gun/scene.gltf", (gltf) => {
      this.gltf = gltf;
      gltf.scene.scale.set(0.1, 0.1, 0.1);
      gltf.scene.traverse((node) => {
        if ((node as Mesh).isMesh) {
          node.castShadow = true;
        }
      });
      gltf.scene.position.set(-0.1, -0.25, 0.2);
      this.recoilGroup.add(this.flashMesh);
      this.recoilGroup.add(gltf.scene);
      this.swayingGroup.add(this.recoilGroup);
      this.group.add(this.swayingGroup);
      scene.add(this.group);

      this.initSwayingAnimation();
      this.initRecoilAnimation();
      this.initAimingAnimation();
      this.initFlashAnimation();
    });
  }

  isHitEnemy(camera: Camera) {
    const raycaster = new Raycaster(new Vector3(), new Vector3(), 0, 10);
    raycaster.setFromCamera(new Vector2(0, 0), camera.getCamera());
    const intersects = raycaster.intersectObjects([this.enemy.model!]);
    if (intersects.length > 0) {
      this.enemy.getShot();
    }
  }

  handleMouseDown(button: number) {
    if (button === 0) {
      this.isShooting = true;
    } else if (button === 2) {
      this.isAiming = true;
      this.swayingAnimation!.stop();
      this.aimingStartAnimation!.start();
    }
  }

  handleMouseUp(button: number) {
    if (button === 0) {
      this.isShooting = false;
    } else if (button === 2) {
      this.isAiming = false;
      this.aimingEndAnimation!.start();
    }
  }

  generateRecoilPosition() {
    const amount = 0.01;
    return {
      x: -Math.random() * amount,
      y: Math.random() * amount,
      z: -Math.random() * amount,
      rotation: 7,
    };
  }

  initFlashAnimation() {
    const currentFlash = { opacity: 0 };
    this.flashAnimation = new Tween(currentFlash)
      .to({ opacity: 1 }, 40)
      .easing(Easing.Quadratic.Out)
      .onUpdate(() => {
        this.flashMesh.material.opacity = currentFlash.opacity;
      })
      .onComplete(() => {
        this.flashMesh.material.opacity = 0;
      });
  }

  initAimingAnimation() {
    const currentPosition = this.swayingGroup.position;
    const finalPosition = new Vector3(0.1, 0.05, 0);

    this.aimingStartAnimation = new Tween(currentPosition)
      .to(finalPosition, 200)
      .easing(Easing.Quadratic.Out);

    this.aimingEndAnimation = new Tween(finalPosition.clone())
      .to(new Vector3(0, 0, 0), 200)
      .easing(Easing.Quadratic.Out)
      .onUpdate((position) => {
        this.swayingGroup.position.copy(position);
      })
      .onComplete(() => {
        this.updateSwayingAnimation();
      });
  }

  initRecoilAnimation() {
    const currentPosition = { x: 0, y: 0, z: 0, rotation: 0 };
    const newPosition = this.generateRecoilPosition();
    const duration = 80;

    this.recoilAnimation = new Tween(currentPosition)
      .to(newPosition, duration)
      .easing(Easing.Quadratic.Out)
      .repeat(1)
      .yoyo(true)
      .onUpdate(() => {
        this.recoilGroup.rotation.x =
          -(currentPosition.rotation * Math.PI) / 180;
        this.recoilGroup.position.copy(
          new Vector3(currentPosition.x, currentPosition.y, currentPosition.z)
        );
      })
      // .onStart(() => {
      //   this.recoilAnimationFinished = false;
      // })
      .onComplete(() => {
        this.recoilAnimationFinished = true;
      });
  }

  initSwayingAnimation() {
    const currentPosition = new Vector3(0, 0, 0);
    const initialPosition = new Vector3(0, 0, 0);
    // const newPosition = new Vector3(-0.015, 0, 0);
    const newPosition = this.swayingNewPosition;
    // const duration = 300;
    const duration = this.swayingDuration;

    this.swayingAnimation = new Tween(currentPosition)
      .to(newPosition, duration)
      .easing(Easing.Quadratic.Out)
      .onUpdate(() => {
        this.swayingGroup.position.copy(currentPosition);
      });

    const swayingBackAnimation = new Tween(currentPosition)
      .to(initialPosition, duration)
      .easing(Easing.Quadratic.Out)
      .onUpdate(() => {
        this.swayingGroup.position.copy(currentPosition);
      })
      .onComplete(() => {
        this.swayingAnimationFinished = true;
      });

    this.swayingAnimation.chain(swayingBackAnimation);
  }

  updateSwayingAnimation() {
    if (!this.swayingAnimation || this.isAiming) {
      return;
    }
    this.swayingAnimation.stop();
    this.swayingAnimationFinished = true;

    if (this.isMoving) {
      this.swayingDuration = 300;
      this.swayingNewPosition = new Vector3(-0.015, 0, 0);
    } else {
      this.swayingDuration = 1000;
      this.swayingNewPosition = new Vector3(-0.005, 0.005, 0);
    }
    this.initSwayingAnimation();
  }

  render(controls: PointerLockControlsCannon, camera: Camera) {
    if (this.gltf) {
      // const direction = controls.getDirection();
      const cameraObj = camera.getCamera();
      // const front = new Vector3();
      // cameraObj.getWorldDirection(front);
      // const right = front.clone().cross(cameraObj.up).normalize();
      // const down = front.clone().cross(right).normalize();
      // if (!this.isMoving && camera.direction.length() > 0) {
      //   this.isMoving = true;
      //   this.updateSwayingAnimation();
      // } else if (this.isMoving && camera.direction.length() === 0) {
      //   this.isMoving = false;
      //   this.updateSwayingAnimation();
      // }
      // if (this.swayingAnimation && this.swayingAnimationFinished) {
      //   this.swayingAnimationFinished = false;
      //   this.swayingAnimation.start();
      // }
      // if (this.isShooting && this.recoilAnimationFinished) {
      //   this.recoilAnimationFinished = false;
      //   this.audio.currentTime = 0;
      //   this.audio.play();
      //   this.recoilAnimation!.start();
      //   this.flashAnimation!.start();
      //   // this.isHitEnemy(camera);
      // }
      this.group.rotation.copy(controls.getObject().rotation);
      this.group.rotateY(Math.PI);
      this.group.rotateX(-Math.PI / 6);
      // this.group.position.copy(controls.yawObject.position);
      // this.group.position.copy(cameraObj.position);
    }
  }
}

export default Gun;
