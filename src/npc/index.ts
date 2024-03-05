import {
  Scene,
  Vector3,
  Clock,
  Euler,
  Group,
  AxesHelper,
  Bone,
  Object3D,
  Raycaster,
  Quaternion,
} from "three";
import World from "../World";

export default class Npc {
  world;
  model?: Object3D;

  constructor(world: World) {
    this.world = world;
  }

  load() {
    return new Promise(async (resolve) => {
      const { model, animations } = await this.world.modelLoader.load(
        "gltf/rifle.glb",
        0.7
      );
      this.model = model;
      this.model.position.set(0, 0, 1);
      console.log(animations);
      // this.state.playAnimation(STATE.AIM);

      resolve(1);
    });
  }

  render = () => {};
}
