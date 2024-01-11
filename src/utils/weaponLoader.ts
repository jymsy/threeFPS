import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import {
  Scene,
  Vector3,
  Group,
  PlaneGeometry,
  TextureLoader,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  Object3D,
} from "three";

type Config = {
  type: string;
  name: string;
  path: string;
  scale: number;
  rotation?: number[];
  position?: number[];
};

const config: Config[] = [
  {
    type: "pistol",
    name: "kimber",
    path: "gltf/kimber_1911.glb",
    scale: 0.05,
    rotation: [-Math.PI / 6, 0, 0],
    position: [0.03, 0.02, 0.05],
  },
  {
    type: "rifle",
    name: "m16",
    path: "gltf/m16.glb",
    scale: 0.0005,
    rotation: [0, Math.PI, 0],
  },
];

type WeaponItem = {
  model: Group;
  config: Config;
};

class WeaponLoader {
  loader = new GLTFLoader();
  weapons: WeaponItem[] = [];
  loaded = false;
  loadedCount = 0;

  load = () => {
    return new Promise<WeaponItem[]>((resolve) => {
      if (this.loaded) {
        return;
      }
      config.forEach((item) => {
        this.loader.load(item.path, (gltf) => {
          gltf.scene.scale.set(item.scale, item.scale, item.scale);
          gltf.scene.traverse((node) => {
            if ((node as Mesh).isMesh) {
              node.castShadow = true;
            }
          });
          if (item.position) {
            const position = item.position;
            gltf.scene.position.set(position[0], position[1], position[2]);
          }
          if (item.rotation) {
            const rotation = item.rotation;
            gltf.scene.rotation.set(rotation[0], rotation[1], rotation[2]);
          }
          this.weapons.push({
            model: gltf.scene,
            config: item,
          });
          this.loadedCount++;

          if (this.loadedCount === config.length) {
            this.loaded = true;
            resolve(this.weapons);
          }
        });
      });
    });
  };
}

export default WeaponLoader;
