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
    });
    const position = mesh.geometry.attributes.position;
    const vertices = new Float32Array(position.count * 3);
    //https://blog.csdn.net/qq_34568700/article/details/127878838
    // @ts-ignore
    const { shape, offset, orientation } = threeToCannon(mesh, {
      type: ShapeType.MESH,
    });
    this.body.addShape(shape, offset, orientation);
  }
}

export default TrimeshCollider;
