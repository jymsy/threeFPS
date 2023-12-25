import {
  Scene,
  SphereGeometry,
  MeshLambertMaterial,
  Mesh,
  Vector3,
  Clock,
} from "three";
import { Body, Vec3, Sphere, Material, World } from "cannon-es";

class Player {
  // mesh;
  body;
  goForward = false;
  goBack = false;
  goRight = false;
  goLeft = false;
  jumping = false;
  speed = 10; //控制器移动速度
  clock = new Clock();
  spaceUp = true;

  constructor(scene: Scene, world: World, material: Material) {
    const shape = new Sphere(0.15);
    this.body = new Body({
      mass: 3,
      // 碰撞体的三维空间中位置
      position: new Vec3(0, 0, 0),
      fixedRotation: true,
      linearDamping: 0.9,
      material: material,
    });
    // this.body.updateMassProperties();
    // 两个圆球，组成胶囊形状
    this.body.addShape(shape, new Vec3(0, -0.25, 0));
    this.body.addShape(shape, new Vec3(0, 0.25, 0));

    world.addBody(this.body);
  }

  render() {
    // console.log(this.body.position, this.body.velocity);
    // this.body.velocity = new Vec3(0, 1, 0);
    // this.mesh.position.copy(
    //   new Vector3(
    //     this.body.position.x,
    //     this.body.position.y,
    //     this.body.position.z
    //   )
    // );
  }
}

export default Player;
