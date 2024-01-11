import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  Scene,
  Vector3,
  Group,
  Mesh,
  AnimationMixer,
  Clock,
  Quaternion,
  AnimationAction,
  LoopOnce,
} from "three";
import { Tween, Easing } from "@tweenjs/tween.js";

export type EnemyModel = {
  id: number;
  model: Enemy;
};

class Enemy {
  mixer?: AnimationMixer;
  clock = new Clock();
  model?: Group;
  runAnimation?: Tween<Vector3>;
  runAction?: AnimationAction;
  fallAction?: AnimationAction;

  constructor(scene: Scene, enemyArray: EnemyModel[]) {
    const loader = new GLTFLoader();

    loader.load("gltf/soldier.glb", (gltf) => {
      gltf.scene.scale.set(0.2, 0.2, 0.2);
      gltf.scene.position.set(0, -0.5, 2);
      gltf.scene.traverse((node) => {
        if ((node as Mesh).isMesh) {
          node.castShadow = true;
        }
      });
      this.model = gltf.scene;
      this.model.name = "enemy";

      enemyArray.push({ id: this.model!.id, model: this });
      scene.add(gltf.scene);

      this.mixer = new AnimationMixer(gltf.scene);
      const fallAnimation = gltf.animations[0];
      const runAnimation = gltf.animations[1];
      this.fallAction = this.mixer.clipAction(fallAnimation);
      // 只播放一次
      this.fallAction.loop = LoopOnce;
      // 物体状态停留在动画结束的时候
      this.fallAction.clampWhenFinished = true;
      this.runAction = this.mixer.clipAction(runAnimation);
      // this.runAction.play();
      // this.initRunAnimation();
    });
  }

  generateMoveVector() {
    const startPosition = new Vector3(
      Math.random() * 2 - 1,
      -0.5,
      Math.random() * 2 - 1
    );
    const direction = new Vector3(
      Math.random() * 2 - 1,
      0,
      Math.random() * 2 - 1
    ).normalize();

    const endPosition = startPosition
      .clone()
      .add(direction.clone().multiplyScalar(2));
    return [startPosition, direction, endPosition];
  }

  initRunAnimation() {
    const initDirection = new Vector3();
    this.model?.getWorldDirection(initDirection);
    const [start, direction, end] = this.generateMoveVector();
    this.model?.position.copy(start);

    // 通过四元数旋转模型到前进方向
    const quaternion = new Quaternion();
    quaternion.setFromUnitVectors(initDirection, direction);
    this.model?.quaternion.multiply(quaternion);

    this.runAnimation = new Tween(this.model!.position)
      .to(end, 3000)
      .easing(Easing.Quadratic.InOut)
      .repeat(Infinity)
      .repeatDelay(800)
      .yoyo(true)
      .onRepeat(() => {
        this.model?.rotateY(Math.PI);
      })
      .start();
  }

  getShot() {
    // this.runAnimation?.stop();
    // this.runAction?.stop();
    // this.fallAction?.play();
    // setTimeout(() => {
    //   this.fallAction?.stop();
    //   this.runAction?.play();
    //   this.initRunAnimation();
    // }, 2000);
  }

  render() {
    this.mixer?.update(this.clock.getDelta());
  }
}

export default Enemy;
