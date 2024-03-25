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
  SpriteMaterial,
  TextureLoader,
  Sprite,
} from "three";
import World from "../World";

export default class Npc {
  world;
  model?: Object3D;
  chatPop;

  constructor(world: World) {
    this.world = world;
    const chatPop = new TextureLoader().load("img/chat_pop.png");
    const material = new SpriteMaterial({
      map: chatPop,
    });
    this.chatPop = new Sprite(material);
    this.chatPop.scale.set(0.2, 0.2, 1);
  }

  load() {
    return new Promise(async (resolve) => {
      const { model, animations } = await this.world.modelLoader.load(
        "gltf/rifle.glb",
        0.7
      );
      this.model = model;
      this.model.position.set(0, 0, 1);
      this.chatPop.position.set(0, 1.5, 1);
      this.world.scene.add(this.chatPop);
      // this.state.playAnimation(STATE.AIM);

      resolve(1);
    });
  }

  // 是否在可交互范围判断
  interactionArea = (position: Vector3) => {
    if (Math.abs(position.y - this.model!.position.y) < 0.5) {
      if (Math.abs(position.x - this.model!.position.x) < 0.5) {
        if (Math.abs(position.z - this.model!.position.z) < 0.5) {
          return true;
        }
      }
    }
    return false;
  };

  render = () => {};
}
