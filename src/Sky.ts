import { CubeTextureLoader } from "three";

class Sky {
  images = [
    "./img/skybox/right.jpg",
    "./img/skybox/left.jpg",
    "./img/skybox/up.jpg",
    "./img/skybox/down.jpg",
    "./img/skybox/back.jpg",
    "./img/skybox/front.jpg",
  ];
  skyBox;

  constructor() {
    const loader = new CubeTextureLoader();
    this.skyBox = loader.load(this.images);
  }
}

export default Sky;
