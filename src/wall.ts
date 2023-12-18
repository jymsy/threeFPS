import {
  BoxGeometry,
  TextureLoader,
  RepeatWrapping,
  MeshLambertMaterial,
  Mesh,
} from "three";

class Wall {
  mesh;

  constructor() {
    const geometry = new BoxGeometry(4, 1, 0.1);
    const texLoader = new TextureLoader();
    const texture = texLoader.load("./img/wall.jpg");
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(4, 2);
    const material = new MeshLambertMaterial({
      map: texture,
    });

    // 两个参数分别为几何体geometry、材质material
    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }
}

export default Wall;
