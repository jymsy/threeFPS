import {
  Body,
  Vec3,
  Sphere,
  World,
  Material as CannonMaterial,
  Plane,
  ContactMaterial,
} from "cannon-es";

class Material {
  physics;

  constructor(world: World) {
    this.physics = new CannonMaterial("physics");
    const physics_physics = new ContactMaterial(this.physics, this.physics, {
      friction: 0,
      restitution: 0,
    });
    world.addContactMaterial(physics_physics);
  }
}

export default Material;
