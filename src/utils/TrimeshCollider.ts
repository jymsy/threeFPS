import { Mesh, Vector3, Quaternion as ThreeQuaternion } from "three";
import { ColliderDesc, World, RigidBodyDesc } from "@dimforge/rapier3d-compat";

class TrimeshCollider {
  constructor(
    world: World,
    mesh: Mesh,
    scale: Vector3,
    quaternion: ThreeQuaternion
  ) {
    let bodyDesc = RigidBodyDesc.fixed().setRotation({
      w: quaternion.w,
      x: quaternion.x,
      y: quaternion.y,
      z: quaternion.z,
    });
    let body = world.createRigidBody(bodyDesc);

    // this.body = new Body({
    //   mass: 0,
    //   position: new Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
    //   quaternion: new Quaternion(
    //     quaternion.x,
    //     quaternion.y,
    //     quaternion.z,
    //     quaternion.w
    //   ),
    //   material,
    // });
    // // mesh.material.color = new Color(1, 0, 0);
    // // mesh.material.wireframe = true;
    const position = mesh.geometry.attributes.position;
    const vertices = new Float32Array(position.count * 3);
    for (let i = 0; i < position.count; i++) {
      vertices[i * 3] = position.getX(i) * scale.x;
      vertices[i * 3 + 1] = position.getY(i) * scale.y;
      vertices[i * 3 + 2] = position.getZ(i) * scale.z;
    }
    const indices = new Uint32Array(mesh.geometry.index!.array);
    const colliderDesc = ColliderDesc.trimesh(vertices, indices);
    world.createCollider(colliderDesc, body);
  }
}

export default TrimeshCollider;
