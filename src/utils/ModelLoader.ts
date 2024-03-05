import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  SkinnedMesh,
  Scene,
  Object3D,
  AnimationClip,
  MeshPhysicalMaterial,
  FrontSide,
  SkeletonHelper,
} from "three";

export type LoadResult = {
  model: Object3D;
  animations: AnimationClip[];
};

class ModelLoader {
  loader;
  scene;
  current = "";

  constructor(scene: Scene) {
    this.loader = new GLTFLoader();
    this.scene = scene;
  }

  load = (path: string, scale: number, traverse?: (node: Object3D) => void) => {
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

        this.scene.add(gltf.scene);
        resolve({ model: gltf.scene, animations: gltf.animations });
      });
    });
  };
}

export default ModelLoader;
