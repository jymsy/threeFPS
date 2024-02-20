import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh, Scene, Object3D, AnimationClip } from "three";

export type LoadResult = {
  model: Object3D;
  animations: AnimationClip[];
};

class ModelLoader {
  loader;
  scene;
  current = "";
  models: Record<string, Object3D> = {};

  constructor(scene: Scene) {
    this.loader = new GLTFLoader();
    this.scene = scene;
  }

  load = (
    name: string,
    path: string,
    scale: number,
    traverse?: (node: Object3D) => void
  ) => {
    return new Promise<LoadResult>(async (resolve) => {
      this.loader.load(path, async (gltf) => {
        gltf.scene.scale.set(scale, scale, scale);
        gltf.scene.traverse((node) => {
          if ((node as Mesh).isMesh) {
            node.castShadow = true;
          }

          if (traverse) {
            traverse(node);
          }
        });

        this.models[name] = gltf.scene;
        resolve({ model: gltf.scene, animations: gltf.animations });
      });
    });
  };

  use = (name: string) => {
    Object.entries(this.models).forEach(([key, model]) => {
      if (name === key) {
        this.scene.add(model);
        this.current = name;
      } else {
        this.scene.remove(model);
      }
    });
  };

  getCurrentModel = () => {
    return this.models[this.current];
  };
}

export default ModelLoader;
