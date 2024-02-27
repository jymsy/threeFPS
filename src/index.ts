import {
  LoadingManager,
  WebGLRenderer,
  Scene as ThreeScene,
  AxesHelper,
  Mesh,
  LineBasicMaterial,
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  BufferGeometry,
  LineSegments,
  BufferAttribute,
} from "three";
import { World, init as initRapier } from "@dimforge/rapier3d-compat";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import TWEEN from "@tweenjs/tween.js";
import Stats from "three/examples/jsm/libs/stats.module";
import Wall from "./wall";
import Floor from "./floor";
import Sky from "./Sky";
import initEventHandlers from "./event";
import Camera from "./camera";
import initLight from "./light";
import Enemy, { EnemyModel } from "./enemy";
import Player from "./player";
import PointerLockControls from "./utils/PointerLockControls";
import Material from "./material";
import Scene from "./Scene";
import initSky from "./Sky";

const debugRapier = (
  lines: LineSegments | null,
  scene: ThreeScene,
  world: World
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

const init = async () => {
  const width = window.innerWidth; //窗口文档显示区的宽度作为画布宽度
  const height = window.innerHeight; //窗口文档显示区的高度作为画布高度
  // 创建渲染器对象
  const renderer = new WebGLRenderer({ antialias: true }); // 抗锯齿
  const camera = new Camera(width / height);
  const enemyArray: EnemyModel[] = [];

  renderer.setPixelRatio(window.devicePixelRatio); //设置设备像素比。通常用于避免HiDPI设备上绘图模糊
  renderer.setSize(width, height); //设置three.js渲染区域的尺寸(像素px)
  renderer.toneMapping = ACESFilmicToneMapping; // 色调映射
  // 在普通计算机显示器或者移动设备屏幕等低动态范围介质上，模拟、逼近高动态范围（HDR）效果
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; // 允许渲染器渲染阴影
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new ThreeScene();
  await initRapier();
  const world = new World({ x: 0.0, y: -9.81, z: 0.0 });
  // const material = new Material(world);
  // const floor = new Floor(world, scene);
  // floor.setPosition(0, -2, 0);
  // floor.setRotation(-Math.PI / 2, 0, 0);

  initSky(scene);
  initLight(scene);
  // AxesHelper：辅助观察的坐标系
  const axesHelper = new AxesHelper(150);
  scene.add(axesHelper);

  // const enemy = new Enemy(scene, enemyArray);
  const controls = new PointerLockControls(scene, camera.getCamera(), world);

  initEventHandlers(controls);
  const stats = new Stats();
  document.body.appendChild(stats.domElement);
  document.getElementById("webgl")!.appendChild(renderer.domElement);

  // for debug
  let debugLines: LineSegments | null = null;

  // 渲染函数
  const render = () => {
    stats.update();
    if (controls.enabled) {
      world.step(); //更新物理计算
      TWEEN.update();
      // debugRapier(debugLines, scene, world);
      player.render(enemyArray);
      // enemy.render();

      renderer.render(scene, camera.getCamera()); //执行渲染操作
    }

    requestAnimationFrame(render); //请求再次执行渲染函数render，渲染下一帧
  };

  const map = new Scene("gltf/de_dust.glb");
  const player = await map.load(scene, world, controls);
  const loading = document.getElementById("loading")!;
  loading.style.display = "none";
  const instructions = document.getElementById("instructions")!;
  instructions.style.display = "flex";
  render();
};

init();

export default init;
