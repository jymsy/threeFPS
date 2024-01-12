import { Object3D } from "three";
import { Body, Vec3, Material, Quaternion } from "cannon-es";
import { threeToCannon, ShapeType } from "three-to-cannon";

class TrimeshCollider {
  body: Body;

  constructor(mesh: Object3D, material: Material) {
    this.body = new Body({
      mass: 0,
      position: new Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
      quaternion: new Quaternion(
        mesh.quaternion.x,
        mesh.quaternion.y,
        mesh.quaternion.z,
        mesh.quaternion.w
      ),
      material,
      // @ts-ignore
    });
    // @ts-ignore
    const { shape, offset, orientation } = threeToCannon(mesh, {
      type: ShapeType.MESH,
    });
    this.body.addShape(shape, offset, orientation);
  }
}

export default TrimeshCollider;
