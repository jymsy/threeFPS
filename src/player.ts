import {
  Scene,
  SphereGeometry,
  MeshLambertMaterial,
  Mesh,
  Vector3,
  Clock,
} from "three";
import {
  Body,
  Vec3,
  Sphere,
  World,
  Material,
  Plane,
  ContactMaterial,
} from "cannon-es";

class Player {
  mesh;
  body;
  goForward = false;
  goBack = false;
  goRight = false;
  goLeft = false;
  jumping = false;
  speed = 10; //控制器移动速度
  clock = new Clock();
  spaceUp = true;

  constructor(scene: Scene, world: World) {
    const geometry = new SphereGeometry(0.15);
    const material = new MeshLambertMaterial({
      color: 0xffff00,
    });
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(1, 0, 1);

    scene.add(this.mesh);
    const shape = new Sphere(0.15);
    this.body = new Body({
      mass: 3,
      // 碰撞体的三维空间中位置
      position: new Vec3(1, -0.2, 1),
      // fixedRotation: true,
      // material: sphereMaterial,
      // shape: new Sphere(1),
    });
    // this.body.updateMassProperties();
    // 两个圆球，组成胶囊形状
    this.body.addShape(shape, new Vec3(0, -0.15, 0));
    this.body.addShape(shape, new Vec3(0, 0.15, 0));

    world.addBody(this.body);
  }

  handleKeyDown(key: string) {
    switch (key) {
      case "w":
        this.goForward = true;
        break;
      case "s":
        this.goBack = true;
        break;
      case "a":
        this.goLeft = true;
        break;
      case "d":
        this.goRight = true;
        break;
      case " ":
        // if (!this.jumping && this.spaceUp) {
        //   this.velocity.y += 15;
        //   this.jumping = true;
        //   this.spaceUp = false;
        // }
        break;
      default:
        break;
    }
  }

  render() {
    console.log(this.body.position, this.body.velocity);

    this.body.velocity = new Vec3(0, 1, 0);

    this.mesh.position.copy(
      new Vector3(
        this.body.position.x,
        this.body.position.y,
        this.body.position.z
      )
    );
  }
}

export default Player;
