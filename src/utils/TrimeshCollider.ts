import { Mesh, Vector3, Quaternion as ThreeQuaternion } from "three";
import { Body, Vec3, Material, Quaternion, Trimesh } from "cannon-es";

class TrimeshCollider {
  body: Body;

  constructor(
    mesh: Mesh,
    material: Material,
    scale: Vector3,
    quaternion: ThreeQuaternion
  ) {
    this.body = new Body({
      mass: 0,
      position: new Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
      quaternion: new Quaternion(
        quaternion.x,
        quaternion.y,
        quaternion.z,
        quaternion.w
      ),
      material,
    });
    // mesh.material.color = new Color(1, 0, 0);
    // mesh.material.wireframe = true;
    const position = mesh.geometry.attributes.position;
    const vertices = [];
    for (let i = 0; i < position.count; i++) {
      vertices[i * 3] = position.getX(i) * scale.x;
      vertices[i * 3 + 1] = position.getY(i) * scale.y;
      vertices[i * 3 + 2] = position.getZ(i) * scale.z;
    }
    let indices = Array.from(mesh.geometry.index!.array);
    this.body.addShape(new Trimesh(vertices, indices));
  }
}

export default TrimeshCollider;
