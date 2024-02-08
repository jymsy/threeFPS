import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { World, RigidBodyDesc } from "@dimforge/rapier3d-compat";
import { Scene as ThreeScene, Mesh, Quaternion } from "three";
import PointerLockControlsCannon from "./utils/pointerLockControlsCannon";
import TrimeshCollider from "./utils/TrimeshCollider";
import Player from "./player";
import State from "./state";

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
      const loader = new GLTFLoader();

      loader.load(this.path, async (gltf) => {
        // gltf.scene.scale.set(3, 3, 3);
        // gltf.scene.position.set(0, 0, 0);

        console.log(gltf.scene);

        const map = gltf.scene;
        State.worldScale.copy(map.children[0].scale);
        State.worldRotation.copy(map.children[0].rotation);
        map.traverse((node) => {
          if (node.type === "Mesh") {
            node.castShadow = true;
            node.receiveShadow = true;
            // node.material.wireframe = true;
            State.worldMapMeshes.push(node);
            new TrimeshCollider(
              world,
              node as Mesh,
              State.worldScale,
              new Quaternion().setFromEuler(State.worldRotation)
            );
          }
        });
        scene.add(map);

        // const player = new Player(world, controls, scene);
        // await player.load();
        // resolve(player);
        resolve(1);
      });
    });
  };
}

export default Scene;
