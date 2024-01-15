import { Mesh, Vector3, Quaternion as ThreeQuaternion } from "three";
import { Body, Vec3, Material, Quaternion, Sphere } from "cannon-es";

class CapsuleCollider {
  body: Body;

  constructor(radius = 0.2) {
    const shape = new Sphere(radius);
    shape.collisionFilterMask;
    this.body = new Body({
      mass: 1,
      allowSleep: false,
      // 碰撞体的三维空间中位置
      position: new Vec3(0, 3, 1),
      fixedRotation: true,
      // linearDamping: 0.9,
      material: new Material({ friction: 0 }),
    });
    // 两个圆球，组成胶囊形状
    this.body.addShape(shape, new Vec3(0, 0, 0));
    this.body.addShape(shape, new Vec3(0, radius * 2, 0));
    this.body.addShape(shape, new Vec3(0, radius * 4, 0));
    this.body.updateMassProperties();
  }
}

export default CapsuleCollider;
