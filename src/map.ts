import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  LoadingManager,
  WebGLRenderer,
  Scene,
  AxesHelper,
  Mesh,
  Color,
  ACESFilmicToneMapping,
  MeshStandardMaterial,
  Vector3,
} from "three";
import { Material, World } from "cannon-es";
import TrimeshCollider from "./utils/TrimeshCollider";

class Map {
  private path;
  constructor(path: string) {
    this.path = path;
  }

  load = (scene: Scene, world: World, material: Material) => {
    return new Promise((resolve) => {
      if (!this.path) {
        return;
      }
      const loader = new GLTFLoader();

      loader.load(this.path, (gltf) => {
        // gltf.scene.scale.set(0.2, 0.2, 0.2);
        gltf.scene.position.set(0, 0, 0);
        gltf.scene.traverse((node) => {
          if (node.type === "Mesh") {
            node.castShadow = true;
            node.receiveShadow = true;
            const phys = new TrimeshCollider(node as Mesh, material);
            world.addBody(phys.body);
          }
        });

        scene.add(gltf.scene);
        resolve(1);
      });
    });
  };
}

export default Map;
