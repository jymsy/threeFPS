import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";

class Gun {
  gltf;
  group;
  swayingGroup;
  swayingAnimationFinished = true;
  swayingAnimation;
  isShooting = false;
  recoilGroup;
  recoilAnimation;
  recoilAnimationFinished = true;
  swayingNewPosition = new THREE.Vector3(-0.005, 0.005, 0);
  swayingDuration = 1000;
  isMoving = false;
  isAiming = false;
  aimingStartAnimation;
  aimingEndAnimation;
  flashAnimation;
  flashMesh;
  audio;

  constructor(scene) {
    this.audio = new Audio("./audio/single-shoot-ak47.wav");
    // 创建GLTF加载器对象
    const loader = new GLTFLoader();
    this.group = new THREE.Group();
    this.swayingGroup = new THREE.Group();
    this.recoilGroup = new THREE.Group();

    const geometry = new THREE.PlaneGeometry(0.2, 0.2);
    const texLoader = new THREE.TextureLoader();
    const texture = texLoader.load("./img/flash_shoot.png");
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
    });

    this.flashMesh = new THREE.Mesh(geometry, material);
    this.flashMesh.position.set(-0.1, -0.27, 0.35);
    this.flashMesh.rotateY(Math.PI);

    loader.load("gltf/gun/scene.gltf", (gltf) => {
      this.gltf = gltf;
      gltf.scene.scale.set(0.1, 0.1, 0.1);
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
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

  handleMouseDown(button) {
    if (button === 0) {
      this.isShooting = true;
    } else if (button === 2) {
      this.isAiming = true;
      this.swayingAnimation.stop();
      this.aimingStartAnimation.start();
    }
  }

  handleMouseUp(button) {
    if (button === 0) {
      this.isShooting = false;
    } else if (button === 2) {
      this.isAiming = false;
      this.aimingEndAnimation.start();
    }
  }

  generateRecoilPosition(currentPosition) {
    const amount = 0.01;
    return {
      x: -Math.random() * amount,
      y: Math.random() * amount,
      z: -Math.random() * amount,
      rotation: 7,
    };
    // return currentPosition
    //   .clone()
    //   .add(
    //     new THREE.Vector3(
    //       -Math.random() * amount,
    //       Math.random() * amount,
    //       -Math.random() * amount
    //     )
    //   );
  }

  initFlashAnimation() {
    const currentFlash = { opacity: 0 };
    this.flashAnimation = new TWEEN.Tween(currentFlash)
      .to({ opacity: 1 }, 40)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        this.flashMesh.material.opacity = currentFlash.opacity;
      })
      .onComplete(() => {
        this.flashMesh.material.opacity = 0;
      });
  }

  initAimingAnimation() {
    const currentPosition = this.swayingGroup.position;
    const finalPosition = new THREE.Vector3(0.1, 0.05, 0);

    this.aimingStartAnimation = new TWEEN.Tween(currentPosition)
      .to(finalPosition, 200)
      .easing(TWEEN.Easing.Quadratic.Out);

    this.aimingEndAnimation = new TWEEN.Tween(finalPosition.clone())
      .to(new THREE.Vector3(0, 0, 0), 200)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate((position) => {
        this.swayingGroup.position.copy(position);
      })
      .onComplete(() => {
        this.updateSwayingAnimation();
      });
  }

  initRecoilAnimation() {
    const currentPosition = { x: 0, y: 0, z: 0, rotation: 0 };
    const newPosition = this.generateRecoilPosition(currentPosition);
    const duration = 80;

    this.recoilAnimation = new TWEEN.Tween(currentPosition)
      .to(newPosition, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .repeat(1)
      .yoyo(true)
      .onUpdate(() => {
        this.recoilGroup.rotation.x =
          -(currentPosition.rotation * Math.PI) / 180;
        this.recoilGroup.position.copy(
          new THREE.Vector3(
            currentPosition.x,
            currentPosition.y,
            currentPosition.z
          )
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
    const currentPosition = new THREE.Vector3(0, 0, 0);
    const initialPosition = new THREE.Vector3(0, 0, 0);
    // const newPosition = new THREE.Vector3(-0.015, 0, 0);
    const newPosition = this.swayingNewPosition;
    // const duration = 300;
    const duration = this.swayingDuration;

    this.swayingAnimation = new TWEEN.Tween(currentPosition)
      .to(newPosition, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        this.swayingGroup.position.copy(currentPosition);
      });

    const swayingBackAnimation = new TWEEN.Tween(currentPosition)
      .to(initialPosition, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
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
      this.swayingNewPosition = new THREE.Vector3(-0.015, 0, 0);
    } else {
      this.swayingDuration = 1000;
      this.swayingNewPosition = new THREE.Vector3(-0.005, 0.005, 0);
    }
    this.initSwayingAnimation();
  }

  render(camera) {
    if (this.gltf) {
      const cameraObj = camera.getCamera();
      const front = new THREE.Vector3();
      cameraObj.getWorldDirection(front);
      // const right = front.clone().cross(cameraObj.up).normalize();
      // const down = front.clone().cross(right).normalize();
      if (!this.isMoving && camera.direction.length() > 0) {
        this.isMoving = true;
        this.updateSwayingAnimation();
      } else if (this.isMoving && camera.direction.length() === 0) {
        this.isMoving = false;
        this.updateSwayingAnimation();
      }
      if (this.swayingAnimation && this.swayingAnimationFinished) {
        this.swayingAnimationFinished = false;
        this.swayingAnimation.start();
      }

      if (this.isShooting && this.recoilAnimationFinished) {
        this.recoilAnimationFinished = false;
        this.audio.currentTime = 0;
        this.audio.play();
        this.recoilAnimation.start();
        this.flashAnimation.start();
      }

      this.group.rotation.copy(cameraObj.rotation);
      this.group.rotateY(Math.PI);
      this.group.rotateX(-Math.PI / 6);
      this.group.position.copy(cameraObj.position);
    }
  }
}

export default Gun;
