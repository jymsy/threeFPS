import {
  Scene,
  Vector3,
  Group,
  PlaneGeometry,
  TextureLoader,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  Object3D,
} from "three";
import { Tween, Easing } from "@tweenjs/tween.js";
import { EnemyModel } from "./enemy";
import PointerLockControlsCannon from "./utils/pointerLockControlsCannon";
import State from "./state";
import WeaponLoader from "./utils/weaponLoader";

class Weapon {
  model?: Group;
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
  currentIndex = 0;
  loader = new WeaponLoader();

  constructor(scene: Scene) {
    this.audio = new Audio("./audio/single-shoot-ak47.wav");
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
    this.flashMesh.rotateY(Math.PI);

    this.loader.load().then((weapons) => {
      this.model = weapons[0].model;
      const flashPosition = weapons[0].config.flashPosition;
      this.flashMesh.position.set(
        flashPosition[0],
        flashPosition[1],
        flashPosition[2]
      );
      this.recoilGroup.add(this.flashMesh);
      this.recoilGroup.add(this.model);
      this.swayingGroup.add(this.recoilGroup);
      this.group.add(this.swayingGroup);
      scene.add(this.group);

      // this.initSwayingAnimation();
      this.initRecoilAnimation();
      this.initAimingAnimation();
      this.initFlashAnimation();
    });
  }

  findEnemyId = (model: Object3D): number => {
    if (model.name === "enemy") {
      return model.id;
    }
    if (model.parent) {
      return this.findEnemyId(model.parent);
    }
    return 0;
  };

  isHitEnemy(controls: PointerLockControlsCannon, enemyArray: EnemyModel[]) {
    const raycaster = new Raycaster(new Vector3(), new Vector3(), 0, 10);
    raycaster.set(controls.yawObject.position, controls.getDirection());
    const intersects = raycaster.intersectObjects(
      enemyArray.map((item) => item.model.model!)
    );
    if (intersects.length > 0) {
      const id = this.findEnemyId(intersects[0].object);
      const enemy = enemyArray.find((item) => item.id === id);
      enemy?.model.getShot();
    }
  }

  handleMouseDown(button: number) {
    if (button === 0) {
      this.isShooting = true;
    } else if (button === 2) {
      this.isAiming = true;
      // this.swayingAnimation!.stop();
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

  switchWeapon(index: number) {
    if (index === this.currentIndex + 1) {
      return;
    }
    this.currentIndex = index - 1;
    this.recoilGroup.remove(this.model!);
    this.model = this.loader.weapons[this.currentIndex].model;
    this.recoilGroup.add(this.model);

    const flashPosition =
      this.loader.weapons[this.currentIndex].config.flashPosition;
    this.flashMesh.position.set(
      flashPosition[0],
      flashPosition[1],
      flashPosition[2]
    );
    
  }

  render(
    controls: PointerLockControlsCannon,
    enemyArray: EnemyModel[],
    moveVelocity: Vector3,
    handPosition: Vector3
  ) {
    if (this.model) {
      // if (!this.isMoving && moveVelocity.length() > 0) {
      //   this.isMoving = true;
      //   this.updateSwayingAnimation();
      // } else if (this.isMoving && moveVelocity.length() === 0) {
      //   this.isMoving = false;
      //   this.updateSwayingAnimation();
      // }
      // if (this.swayingAnimation && this.swayingAnimationFinished) {
      //   this.swayingAnimationFinished = false;
      //   this.swayingAnimation.start();
      // }
      if (this.isShooting && this.recoilAnimationFinished) {
        this.recoilAnimationFinished = false;
        this.audio.currentTime = 0;
        this.audio.play();
        this.recoilAnimation!.start();
        this.flashAnimation!.start();
        this.isHitEnemy(controls, enemyArray);
      }

      this.group.rotation.copy(controls.yawObject.rotation);
      this.group.position.copy(handPosition); // 枪跟随手(tps)
    }
  }
}

export default Weapon;
