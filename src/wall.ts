import {
  BoxGeometry,
  TextureLoader,
  RepeatWrapping,
  MeshLambertMaterial,
  Mesh,
  Scene,
  Euler,
} from "three";
import { Body, Vec3, Material, World, Box } from "cannon-es";

class Wall {
  mesh;
  body;

  constructor(world: World, cannonMaterial: Material, scene: Scene) {
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
    scene.add(this.mesh);

    this.body = new Body({
      mass: 0,
      // position: new Vec3(0, -0.2, 0),
      // fixedRotation: true,
      // linearDamping: 0.9,
      material: cannonMaterial,
      shape: new Box(new Vec3(4, 1, 0.1)),
    });

    world.addBody(this.body);
  }

  setPosition = (x: number, y: number, z: number) => {
    this.mesh.position.set(x, y, z);
    this.body.position.set(x, y, z);
  };

  setRotation = (x: number, y: number, z: number) => {
    this.mesh.setRotationFromEuler(new Euler(x, y, z));
    this.body.quaternion.setFromEuler(x, y, z);
  };
}

export default Wall;
