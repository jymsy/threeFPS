import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import {
  Scene,
  Vector3,
  Group,
  PlaneGeometry,
  TextureLoader,
  MeshBasicMaterial,
  Mesh,
  AnimationMixer,
  Clock,
} from "three";
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
      const runAnimation = gltf.animations[3];
      this.mixer = new AnimationMixer(gltf.scene);
      const action = this.mixer.clipAction(runAnimation);
      action.play();
      this.initRunAnimation();
    });
  }

  initRunAnimation() {
    const runAnimation = new Tween(this.model!.position)
      .to(new Vector3(0, -0.5, 4), 4000)
      .easing(Easing.Quadratic.InOut)
      .repeat(Infinity)
      .yoyo(true);

    runAnimation.start();
  }

  render() {
    this.mixer?.update(this.clock.getDelta());
  }
}

export default Enemy;
