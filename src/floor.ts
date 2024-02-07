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
import { World, RigidBodyDesc, ColliderDesc } from "@dimforge/rapier3d-compat";

class Floor {
  mesh;
  bodyDesc;
  body;

  constructor(world: World, scene: Scene, width = 400, height = 400) {
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
    this.bodyDesc = RigidBodyDesc.fixed();
    this.body = world.createRigidBody(this.bodyDesc);
    let colliderDesc = ColliderDesc.cuboid(width / 2, 0.1, height / 2);
    world.createCollider(colliderDesc, this.body);

    // groundBody.position.y = -0.5;
    // 改变平面默认的方向，法线默认沿着z轴，旋转到平面向上朝着y方向
    // groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); //旋转规律类似threejs 平面
  }

  setPosition = (x: number, y: number, z: number) => {
    this.mesh.position.set(x, y, z);
    this.body.setTranslation({ x, y, z }, false);
  };

  setRotation = (x: number, y: number, z: number) => {
    this.mesh.setRotationFromEuler(new Euler(x, y, z));
    // this.body.quaternion.setFromEuler(x, y, z);
  };
}

export default Floor;
