import { World, RigidBodyDesc, ColliderDesc } from "@dimforge/rapier3d-compat";

class CapsuleCollider {
  body;
  controller;

  constructor(world: World) {
    // Character.
    let characterDesc = RigidBodyDesc.kinematicPositionBased().setTranslation(
      1,
      3,
      4
    );
    this.body = world.createRigidBody(characterDesc);
    let characterColliderDesc = ColliderDesc.capsule(0.4, 0.2);
    let characterCollider = world.createCollider(
      characterColliderDesc,
      this.body
    );

    this.controller = world.createCharacterController(0.03);
    this.controller.enableAutostep(0.3, 0.1, true);
    this.controller.enableSnapToGround(0.3);
  }
}

export default CapsuleCollider;
