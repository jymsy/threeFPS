import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  Scene as ThreeScene,
  Mesh,
  Color,
  ACESFilmicToneMapping,
  MeshStandardMaterial,
  Vector3,
  Quaternion,
} from "three";
import { Material, World } from "cannon-es";
import PointerLockControlsCannon from "./utils/pointerLockControlsCannon";
import TrimeshCollider from "./utils/TrimeshCollider";
import Player from "./player";

class Scene {
  private path;
  constructor(path: string) {
    this.path = path;
  }

  load = (
    scene: ThreeScene,
    world: World,
    controls: PointerLockControlsCannon
  ) => {
    return new Promise<Player>((resolve) => {
      if (!this.path) {
        return;
      }
      const material = new Material({ friction: 0 });
      const loader = new GLTFLoader();

      loader.load(this.path, async (gltf) => {
        // gltf.scene.scale.set(3, 3, 3);
        // gltf.scene.position.set(0, 0, 0);
        gltf.scene.traverse((node) => {
          if (node.type === "Mesh") {
            node.castShadow = true;
            node.receiveShadow = true;
            const phys = new TrimeshCollider(
              node as Mesh,
              material,
              node.parent?.parent?.scale!,
              node.parent?.parent?.quaternion!
            );
            world.addBody(phys.body);
          }
        });
        scene.add(gltf.scene);

        const player = new Player(world, controls);
        await player.load(scene);
        resolve(player);
      });
    });
  };
}

export default Scene;
