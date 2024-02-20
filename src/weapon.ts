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
  Audio,
  Quaternion,
  AxesHelper,
} from "three";
import { Tween, Easing } from "@tweenjs/tween.js";
import { EnemyModel } from "./enemy";
import PointerLockControls from "./utils/PointerLockControls";
import State from "./state";
import WeaponLoader from "./utils/weaponLoader";
import BulletHoleMesh from "./utils/BulletHoleMesh";
import BulletStore from "./utils/BulletStore";
import AudioLoader from "./utils/AudioLoader";

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
  currentIndex = 1;
  loader = new WeaponLoader();
  bulletHole = new BulletHoleMesh("decal");
  scene: Scene;
  audioLoader;

  constructor(scene: Scene, controls: PointerLockControls) {
    this.audioLoader = new AudioLoader(controls);
    this.group = new Group();
    this.swayingGroup = new Group();
    this.recoilGroup = new Group();
    this.scene = scene;
    BulletStore.init();

    const texLoader = new TextureLoader();
    const geometry = new PlaneGeometry(0.2, 0.2);
    const texture = texLoader.load("./img/flash_shoot.png");
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
    });

    this.flashMesh = new Mesh(geometry, material);
    this.flashMesh.rotateY(Math.PI);
  }

  load() {
    return new Promise(async (resolve) => {
      const weapons = await this.loader.load();
      this.model = weapons[this.currentIndex].model;
      const axesHelper = new AxesHelper(150);
      this.model.add(axesHelper);
      const flashPosition = weapons[this.currentIndex].config.flashPosition;
      this.flashMesh.position.set(
        flashPosition[0],
        flashPosition[1],
        flashPosition[2]
      );
      this.recoilGroup.add(this.flashMesh);
      this.recoilGroup.add(this.model);
      this.swayingGroup.add(this.recoilGroup);
      this.group.add(this.swayingGroup);
      this.scene.add(this.group);

      await this.audioLoader.load("shooting", "./audio/single-shoot-ak47.wav");
      await this.audioLoader.load("empty", "./audio/shoot-without-bullet.wav");

      // this.initSwayingAnimation();
      this.initRecoilAnimation();
      this.initAimingAnimation();
      this.initFlashAnimation();
      resolve(1);
    });
  }

  reload() {
    BulletStore.reload();
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

  beginAiming = () => {
    this.isAiming = true;
    if (State.firstPerson) {
      // this.swayingAnimation!.stop();
      this.aimingStartAnimation!.start();
    }
  };

  endAiming = () => {
    this.isAiming = false;
    if (State.firstPerson) {
      this.aimingEndAnimation!.start();
    }
  };

  beginShooting = () => {
    this.isShooting = true;
  };

  endShooting = () => {
    this.isShooting = false;
  };

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
      // .onUpdate(() => {
      //   this.recoilGroup.rotation.x =
      //     -(currentPosition.rotation * Math.PI) / 180;
      //   this.recoilGroup.position.copy(
      //     new Vector3(currentPosition.x, currentPosition.y, currentPosition.z)
      //   );
      // })
      .onStart(() => {
        this.recoilAnimationFinished = false;
      })
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

  bulletCollision(controls: PointerLockControls, enemyArray: EnemyModel[]) {
    const raycaster = new Raycaster(new Vector3(), new Vector3(), 0, 100);
    raycaster.set(
      controls.yawObject.children[0].getWorldPosition(new Vector3()),
      controls.getDirection()
    );
    const intersectsEnemy = raycaster.intersectObjects(
      enemyArray.map((item) => item.model.model!)
    );
    if (intersectsEnemy.length > 0) {
      // shoot enemy
      const id = this.findEnemyId(intersectsEnemy[0].object);
      const enemy = enemyArray.find((item) => item.id === id);
      enemy?.model.getShot();
    } else {
      const intersectsWorld = raycaster.intersectObjects(
        State.worldMapMeshes,
        false
      );
      if (intersectsWorld.length > 0) {
        // 击中world
        this.bulletHole.create(intersectsWorld[0], this.scene!);
      }
    }
  }

  render(
    controls: PointerLockControls,
    enemyArray: EnemyModel[],
    moveVelocity: Vector3,
    rightHand: Object3D
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
        if (BulletStore.count === 0) {
          this.audioLoader.play("empty");
          return;
        }
        this.audioLoader.play("shooting");
        BulletStore.decrease();
        this.recoilAnimation!.start();
        this.flashAnimation!.start();
        this.bulletCollision(controls, enemyArray);
      }

      const handPosition = new Vector3();
      const handQuaternion = new Quaternion();
      rightHand.getWorldPosition(handPosition);
      rightHand.getWorldQuaternion(handQuaternion);
      // this.group.rotation.copy(controls.yawObject.rotation);
      this.group.position.copy(handPosition); // 枪跟随手(tps)
      this.group.quaternion.copy(handQuaternion);
      this.group.rotateX(-Math.PI / 2).rotateZ(-Math.PI / 2);
    }
  }
}

export default Weapon;
