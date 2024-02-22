import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  SkinnedMesh,
  Scene,
  Object3D,
  AnimationClip,
  MeshPhysicalMaterial,
  FrontSide,
} from "three";

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
        // const helper = new SkeletonHelper(gltf.scene);
        // this.scene.add(helper);
        gltf.scene.scale.set(scale, scale, scale);
        gltf.scene.traverse((node) => {
          if ((node as SkinnedMesh).isMesh) {
            node.castShadow = true;
            ((node as SkinnedMesh).material as MeshPhysicalMaterial).side =
              FrontSide;
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
