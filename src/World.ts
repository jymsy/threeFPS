import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  World as PyhsicsWorld,
  RigidBodyDesc,
} from "@dimforge/rapier3d-compat";
import TWEEN from "@tweenjs/tween.js";
import {
  Scene as ThreeScene,
  Mesh,
  Quaternion,
  LineSegments,
  LineBasicMaterial,
  BufferGeometry,
  BufferAttribute,
} from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import PointerLockControls from "./utils/PointerLockControls";
import TrimeshCollider from "./utils/TrimeshCollider";
import initLight from "./light";
import Player from "./player";
import State from "./state";
import initSky from "./Sky";
import Camera from "./Camera";
import initEventHandlers from "./event";
import IRenderItem from "./interfaces/IRenderItem";
import ModelLoader from "./utils/ModelLoader";
import Npc from "./npc";

const debugRapier = (
  lines: LineSegments | null,
  scene: ThreeScene,
  world: PyhsicsWorld
) => {
  if (!lines) {
    let material = new LineBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
    });
    let geometry = new BufferGeometry();
    lines = new LineSegments(geometry, material);
    scene.add(lines);
  }

  const { vertices, colors } = world.debugRender();
  lines.geometry.setAttribute("position", new BufferAttribute(vertices, 3));
  lines.geometry.setAttribute("color", new BufferAttribute(colors, 4));
};

// for debug
let debugLines: LineSegments | null = null;

class World {
  private path;
  physicsWorld;
  scene;
  stats;
  controls;
  renderList: IRenderItem[] = [];
  modelLoader;

  constructor(path: string, camera: Camera) {
    this.path = path;
    this.physicsWorld = new PyhsicsWorld({ x: 0.0, y: -9.81, z: 0.0 });
    this.scene = new ThreeScene();

    initSky(this.scene);
    initLight(this.scene);
    // // AxesHelper：辅助观察的坐标系
    // const axesHelper = new AxesHelper(150);
    // this.scene.add(axesHelper);

    this.controls = new PointerLockControls(
      this.scene,
      camera.getCamera(),
      this.physicsWorld
    );
    initEventHandlers(this.controls);
    this.modelLoader = new ModelLoader(this.scene);
    this.stats = new Stats();
    document.body.appendChild(this.stats.domElement);
  }

  load = () => {
    return new Promise<Player>((resolve) => {
      if (!this.path) {
        return;
      }
      const loader = new GLTFLoader();

      loader.load(this.path, async (gltf) => {
        // gltf.scene.scale.set(3, 3, 3);
        // gltf.scene.position.set(0, 0, 0);
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
              this.physicsWorld,
              node as Mesh,
              State.worldScale,
              new Quaternion().setFromEuler(State.worldRotation)
            );
          }
        });
        this.scene.add(map);

        const player = new Player(this);
        await player.load();
        this.renderList.push(player);

        const npc = new Npc(this);
        await npc.load();
        this.renderList.push(npc);
        resolve(player);
      });
    });
  };

  render = () => {
    this.stats.update();
    // if (this.controls.enabled) {
    this.physicsWorld.step(); //更新物理计算
    TWEEN.update();
    // debugRapier(debugLines, scene, world);
    this.renderList.forEach((item) => item.render());

    // }
  };
}

export default World;
