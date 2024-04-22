import { CubeTextureLoader, Scene } from "three";

const initSky = (scene: Scene) => {
  const images = [
    "./img/skybox/right.jpg",
    "./img/skybox/left.jpg",
    "./img/skybox/up.jpg",
    "./img/skybox/down.jpg",
    "./img/skybox/front.jpg",
    "./img/skybox/back.jpg",
  ];
  const loader = new CubeTextureLoader();
  scene.background = loader.load(images);
};

export default initSky;
