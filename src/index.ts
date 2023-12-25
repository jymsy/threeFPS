import * as THREE from "three";
import { Body, Vec3, Sphere, World, Plane } from "cannon-es";
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
import Gun from "./gun";
import Enemy from "./enemy";
import Player from "./player";
import PointerLockControlsCannon from "./utils/pointerLockControlsCannon";
import Material from "./material";

const init = () => {
  const width = window.innerWidth; //窗口文档显示区的宽度作为画布宽度
  const height = window.innerHeight; //窗口文档显示区的高度作为画布高度
  // 实例化一个gui对象
  // const gui = new GUI();
  // 创建渲染器对象
  const renderer = new THREE.WebGLRenderer({ antialias: true }); // 抗锯齿
  const camera = new Camera(width / height);

  renderer.setPixelRatio(window.devicePixelRatio); //设置设备像素比。通常用于避免HiDPI设备上绘图模糊
  renderer.setSize(width, height); //设置three.js渲染区域的尺寸(像素px)
  renderer.shadowMap.enabled = true; // 允许渲染器渲染阴影
  // renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  const world = new World();
  world.gravity.set(0, -9.8, 0); //单位：m/s²
  const material = new Material(world);

  const frontWall = new Wall(world, material.physics, scene);
  frontWall.setPosition(0, 0, -2);

  const leftWall = new Wall(world, material.physics, scene);
  leftWall.setPosition(-2, 0, 0);
  leftWall.setRotation(0, Math.PI / 2, 0);

  const rightWall = new Wall(world, material.physics, scene);
  rightWall.setPosition(2, 0, 0);
  rightWall.setRotation(0, Math.PI / 2, 0);

  // const backWall = new Wall();
  // backWall.mesh.translateZ(2);
  // scene.add(backWall.mesh);

  const floor = new Floor(world, material.physics, scene);
  floor.setPosition(0, -0.5, 0);
  floor.setRotation(-Math.PI / 2, 0, 0);

  const floor2 = new Floor(world, material.physics, scene, 1, 4);
  floor2.setPosition(-1, 0, 2);
  floor2.setRotation((-2 * Math.PI) / 3, 0, 0);

  const sky = new Sky();
  scene.background = sky.skyBox;

  // AxesHelper：辅助观察的坐标系
  const axesHelper = new THREE.AxesHelper(150);
  scene.add(axesHelper);

  initLight(scene);
  const enemy = new Enemy(scene);
  const gun = new Gun(scene, enemy);
  const controls = new PointerLockControlsCannon(camera.getCamera());
  const player = new Player(world, material.physics, controls);

  scene.add(controls.getObject());
  initEventHandlers(camera, controls, gun, player);
  // const stats = new Stats();
  // document.body.appendChild(stats.domElement);
  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.update();
  document.getElementById("webgl")!.appendChild(renderer.domElement);

  // 渲染函数
  function render() {
    // stats.update();
    if (controls.enabled) {
      world.fixedStep(); //更新物理计算
      player.render();
      TWEEN.update();
      controls.render(player.body);
      // camera.render(controls, scene);
      gun.render(controls);
      enemy.render();
      renderer.render(scene, camera.getCamera()); //执行渲染操作
    }

    requestAnimationFrame(render); //请求再次执行渲染函数render，渲染下一帧
  }
  render();
};

init();

export default init;
