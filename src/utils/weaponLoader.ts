import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Group, Mesh } from "three";

type Config = {
  type: "pistol" | "rifle";
  name: string;
  path: string;
  scale: number;
  rotation?: number[];
  position?: number[];
  flashPosition: number[];
};

export const weaponConfig: Config[] = [
  {
    type: "pistol",
    name: "kimber",
    path: "gltf/kimber_1911.glb",
    scale: 0.05,
    rotation: [-Math.PI / 6, 0, 0],
    position: [0.03, 0.02, 0.05],
    flashPosition: [0.03, 0.04, 0.12],
  },
  {
    type: "rifle",
    name: "m16",
    path: "gltf/m16.glb",
    scale: 0.0008,
    rotation: [0, Math.PI - 0.2, 0.2],
    position: [0.02, 0.04, 0.1],
    flashPosition: [-0.05, 0.02, 0.55],
  },
];

type WeaponItem = {
  model: Group;
  config: Config;
};

class WeaponLoader {
  loader = new GLTFLoader();
  weapons: Record<string, WeaponItem> = {};
  loaded = false;
  loadedCount = 0;

  load = () => {
    return new Promise<Record<string, WeaponItem>>((resolve) => {
      if (this.loaded) {
        return;
      }
      weaponConfig.forEach((item) => {
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
          this.weapons[item.name] = {
            model: gltf.scene,
            config: item,
          };
          this.loadedCount++;

          if (this.loadedCount === weaponConfig.length) {
            this.loaded = true;
            resolve(this.weapons);
          }
        });
      });
    });
  };
}

export default WeaponLoader;
