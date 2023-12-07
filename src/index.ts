import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
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

const init = () => {
  const width = window.innerWidth; //窗口文档显示区的宽度作为画布宽度
  const height = window.innerHeight; //窗口文档显示区的高度作为画布高度
  // 实例化一个gui对象
  // const gui = new GUI();
  // 创建渲染器对象
  const renderer = new THREE.WebGLRenderer({ antialias: true }); // 抗锯齿
  const camera = new Camera(width / height);
  const pointerControl = new PointerLockControls(
    camera.getCamera(),
    document.body
  );

  renderer.setPixelRatio(window.devicePixelRatio); //设置设备像素比。通常用于避免HiDPI设备上绘图模糊
  renderer.setSize(width, height); //设置three.js渲染区域的尺寸(像素px)
  renderer.shadowMap.enabled = true; // 允许渲染器渲染阴影
  // renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();

  const frontWall = new Wall();
  frontWall.mesh.translateZ(-2);
  scene.add(frontWall.mesh);

  const leftWall = new Wall();
  leftWall.mesh.translateX(-2);
  leftWall.mesh.rotateY(Math.PI / 2);
  scene.add(leftWall.mesh);

  const rightWall = new Wall();
  rightWall.mesh.translateX(2);
  rightWall.mesh.rotateY(Math.PI / 2);
  scene.add(rightWall.mesh);

  // const backWall = new Wall();
  // backWall.mesh.translateZ(2);
  // scene.add(backWall.mesh);

  const floor = new Floor();
  floor.mesh.translateY(-0.5);
  floor.mesh.rotateX(Math.PI / 2);
  scene.add(floor.mesh);

  const sky = new Sky();
  scene.background = sky.skyBox;

  // AxesHelper：辅助观察的坐标系
  const axesHelper = new THREE.AxesHelper(150);
  scene.add(axesHelper);

  initLight(scene);
  const gun = new Gun(scene);
  const enemy = new Enemy(scene);
  initEventHandlers(camera, pointerControl, gun);

  // const stats = new Stats();
  // document.body.appendChild(stats.domElement);
  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.update();
  document.getElementById("webgl")!.appendChild(renderer.domElement);

  // 渲染函数
  function render() {
    // stats.update();
    if (pointerControl.isLocked) {
      TWEEN.update();
      camera.render(pointerControl, scene);
      gun.render(camera);
      enemy.render();
      renderer.render(scene, camera.getCamera()); //执行渲染操作
    }

    requestAnimationFrame(render); //请求再次执行渲染函数render，渲染下一帧
  }
  render();
};

init();

export default init;
