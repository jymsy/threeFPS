import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { World as PhysicsWorld } from "@dimforge/rapier3d-compat";
import TWEEN from "@tweenjs/tween.js";
import {
  Scene as ThreeScene,
  Mesh,
  Quaternion,
  LineSegments,
  LineBasicMaterial,
  BufferGeometry,
  BufferAttribute,
  Vector3,
} from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import PointerLockControls from "./utils/PointerLockControls";
import TrimeshCollider from "./utils/TrimeshCollider";
import initLight from "./light";
import Player from "./player";
import State from "./state";
import initSky from "./Sky";
import IRenderItem from "./interfaces/IRenderItem";
import ModelLoader from "./utils/ModelLoader";
import Npc from "./npc";
import InputManager from "./utils/InputManager";

// for debug
let debugLines: LineSegments | null = null;

const debugRapier = (scene: ThreeScene, world: PhysicsWorld) => {
  if (!debugLines) {
    let material = new LineBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
    });
    let geometry = new BufferGeometry();
    debugLines = new LineSegments(geometry, material);
    scene.add(debugLines);
  }

  const { vertices, colors } = world.debugRender();
  debugLines.geometry.setAttribute(
    "position",
    new BufferAttribute(vertices, 3)
  );
  debugLines.geometry.setAttribute("color", new BufferAttribute(colors, 4));
};

class World {
  private path;
  physicsWorld;
  scene;
  stats;
  controls;
  renderList: IRenderItem[] = [];
  modelLoader;
  npcList: Npc[] = [];
  interactionElement;
  inputWrapperElement;
  inputElement;
  inputManager;

  constructor(path: string, aspect: number) {
    this.path = path;
    this.physicsWorld = new PhysicsWorld({ x: 0.0, y: -9.81, z: 0.0 });
    this.scene = new ThreeScene();

    initSky(this.scene);
    initLight(this.scene);
    // // AxesHelper：辅助观察的坐标系
    // const axesHelper = new AxesHelper(150);
    // this.scene.add(axesHelper);

    this.controls = new PointerLockControls(
      this.scene,
      this.physicsWorld,
      aspect
    );
    this.inputManager = new InputManager(this.controls);

    this.modelLoader = new ModelLoader(this.scene);
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    this.interactionElement = document.getElementById("interaction");
    this.inputWrapperElement = document.getElementById("input-wrapper");
    this.inputElement = document.getElementById("input");
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
        this.npcList.push(npc);
        this.renderList.push(npc);

        this.handleEvent(player);
        resolve(player);
      });
    });
  };

  handleEvent = (player: Player) => {
    const instructions = document.getElementById("instructions")!;
    const blocker = document.getElementById("blocker")!;

    instructions.addEventListener("click", () => {
      this.controls.lock();
    });

    this.controls.addEventListener("lock", () => {
      instructions.style.display = "none";
      blocker.style.display = "none";
    });

    this.controls.addEventListener("unlock", () => {
      if (player.inputting) {
        return;
      }
      blocker.style.display = "block";
      instructions.style.display = "flex";
    });
  };

  detectNpc = (playerPosition: Vector3) => {
    const npc = this.npcList.find((npc) => npc.interactionArea(playerPosition));
    if (npc) {
      this.interactionElement!.style.visibility = "visible";
      return true;
    } else {
      this.interactionElement!.style.visibility = "hidden";
      return false;
    }
  };

  render = () => {
    this.stats.update();
    if (this.controls.enabled) {
      this.physicsWorld.step(); //更新物理计算
      TWEEN.update();
      // debugRapier(scene, world);
      this.renderList.forEach((item) => item.render());
    }
  };
}

export default World;
