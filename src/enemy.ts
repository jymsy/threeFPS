import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  Scene,
  Vector3,
  Group,
  Mesh,
  AnimationMixer,
  Clock,
  Quaternion,
} from "three";
import { Tween, Easing } from "@tweenjs/tween.js";

class Enemy {
  mixer?: AnimationMixer;
  clock = new Clock();
  model?: Group;

  constructor(scene: Scene) {
    const loader = new GLTFLoader();

    loader.load("gltf/soldier.glb", (gltf) => {
      gltf.scene.scale.set(0.35, 0.35, 0.35);
      gltf.scene.position.set(0, -0.5, 2);
      gltf.scene.traverse((node) => {
        if ((node as Mesh).isMesh) {
          node.castShadow = true;
        }
      });
      this.model = gltf.scene;
      scene.add(gltf.scene);

      console.log(gltf.animations);
      this.mixer = new AnimationMixer(gltf.scene);
      const runAnimation = gltf.animations[1];
      const action = this.mixer.clipAction(runAnimation);
      action.play();
      this.initRunAnimation();
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
    const initDirection = new Vector3(0, 0, 1);
    const [start, direction, end] = this.generateMoveVector();
    this.model?.position.copy(start);

    // 通过四元数旋转模型到前进方向
    const quaternion = new Quaternion();
    quaternion.setFromUnitVectors(initDirection, direction);
    this.model?.quaternion.multiply(quaternion);

    new Tween(this.model!.position)
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

  render() {
    this.mixer?.update(this.clock.getDelta());
  }
}

export default Enemy;
