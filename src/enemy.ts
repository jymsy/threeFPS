import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Scene, Vector3, Group, Mesh, AnimationMixer, Clock } from "three";
import { Tween, Easing } from "@tweenjs/tween.js";

class Enemy {
  mixer?: AnimationMixer;
  clock = new Clock();
  model?: Group;

  constructor(scene: Scene) {
    const loader = new GLTFLoader();

    loader.load("gltf/Xbot.glb", (gltf) => {
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
      const runAnimation = gltf.animations[3];
      const action = this.mixer.clipAction(runAnimation);
      action.play();
      this.initRunAnimation();
    });
  }

  initRunAnimation() {
    new Tween(this.model!.position)
      .to(new Vector3(0, -0.5, 4), 4000)
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
