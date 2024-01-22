import {
  LoadingManager,
  WebGLRenderer,
  Scene as ThreeScene,
  AxesHelper,
  Mesh,
  ACESFilmicToneMapping,
} from "three";
import { Body, Vec3, Sphere, World, Plane, SAPBroadphase } from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import TWEEN from "@tweenjs/tween.js";
import Stats from "three/examples/jsm/libs/stats.module";
import Wall from "./wall";
import Floor from "./floor";
import Sky from "./sky";
import initEventHandlers from "./event";
import Camera from "./camera";
import initLight from "./light";
import Enemy, { EnemyModel } from "./enemy";
import Player from "./player";
import PointerLockControlsCannon from "./utils/pointerLockControlsCannon";
import Material from "./material";
import Scene from "./Scene";

const init = async () => {
  const width = window.innerWidth; //窗口文档显示区的宽度作为画布宽度
  const height = window.innerHeight; //窗口文档显示区的高度作为画布高度
  // 实例化一个gui对象
  // const gui = new GUI();
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
  // renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new ThreeScene();
  const world = new World();

  world.gravity.set(0, -9.8, 0); //单位：m/s²
  world.broadphase = new SAPBroadphase(world); // 碰撞测试算法 https://blog.csdn.net/weixin_43990650/article/details/121815208
  world.allowSleep = true;
  const material = new Material(world);
  // const cannonDebugger = new CannonDebugger(scene, world);
  // const floor = new Floor(world, material.physics, scene);
  // floor.setPosition(0, 2, 0);
  // floor.setRotation(-Math.PI / 2, 0, 0);

  const sky = new Sky();
  scene.background = sky.skyBox;

  // AxesHelper：辅助观察的坐标系
  const axesHelper = new AxesHelper(150);
  scene.add(axesHelper);

  initLight(scene);
  // const enemy = new Enemy(scene, enemyArray);
  const controls = new PointerLockControlsCannon(scene, camera.getCamera());

  initEventHandlers(controls);
  const stats = new Stats();
  document.body.appendChild(stats.domElement);
  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.update();
  document.getElementById("webgl")!.appendChild(renderer.domElement);

  // 渲染函数
  const render = () => {
    stats.update();
    if (controls.enabled) {
      world.fixedStep(); //更新物理计算
      // cannonDebugger.update();
      TWEEN.update();
      controls.render(player.body);
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
