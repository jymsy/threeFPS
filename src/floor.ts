import {
  PlaneGeometry,
  TextureLoader,
  RepeatWrapping,
  MeshLambertMaterial,
  Mesh,
  Scene,
  DoubleSide,
  Euler,
} from "three";
import { Body, Vec3, Material, World, Box, Plane } from "cannon-es";

class Floor {
  mesh;
  body;

  constructor(
    world: World,
    cannonMaterial: Material,
    scene: Scene,
    width = 40,
    height = 40
  ) {
    const geometry = new PlaneGeometry(width, height);
    const texLoader = new TextureLoader();
    const texture = texLoader.load("./img/ground.jpg");
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(width, height);
    const material = new MeshLambertMaterial({
      map: texture,
      side: DoubleSide,
    });

    // 两个参数分别为几何体geometry、材质material
    this.mesh = new Mesh(geometry, material);
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    // 物理地面
    const plane = new Plane();
    this.body = new Body({
      mass: 0, // 质量为0，始终保持静止，不会受到力碰撞或加速度影响
      shape: plane,
      material: cannonMaterial,
    });
    // groundBody.position.y = -0.5;
    // 改变平面默认的方向，法线默认沿着z轴，旋转到平面向上朝着y方向
    // groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); //旋转规律类似threejs 平面
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

export default Floor;
