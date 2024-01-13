import { Object3D, Mesh } from "three";
import { Body, Vec3, Material, Quaternion, Trimesh } from "cannon-es";

class TrimeshCollider {
  body: Body;

  constructor(mesh: Mesh, material: Material) {
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
    // mesh.material.wireframe = true;
    const position = mesh.geometry.attributes.position;
    const vertices = [];
    for (let i = 0; i < position.count; i++) {
      vertices[i * 3] = position.getX(i) * mesh.scale.x;
      vertices[i * 3 + 1] = position.getY(i) * mesh.scale.y;
      vertices[i * 3 + 2] = position.getZ(i) * mesh.scale.z;
    }
    let indices = Array.from(mesh.geometry.index!.array);
    this.body.addShape(new Trimesh(vertices, indices));
  }
}

export default TrimeshCollider;
