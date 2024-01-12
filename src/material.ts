import { World, Material as CannonMaterial, ContactMaterial } from "cannon-es";

class Material {
  physics;

  constructor(world: World) {
    this.physics = new CannonMaterial("physics");
    const physics_physics = new ContactMaterial(this.physics, this.physics, {
      friction: 0.3,
      restitution: 0,
    });
    world.addContactMaterial(physics_physics);
  }
}

export default Material;
