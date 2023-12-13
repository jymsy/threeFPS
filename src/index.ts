import * as THREE from "three";
import {
  Body,
  Vec3,
  Sphere,
  World,
  Material,
  Plane,
  ContactMaterial,
} from "cannon-es";
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
  const enemy = new Enemy(scene);
  const gun = new Gun(scene, enemy);
  initEventHandlers(camera, pointerControl, gun);

  const sphereMaterial = new Material();
  const body = new Body({
    mass: 0.3,
    // 碰撞体的三维空间中位置
    position: new Vec3(1, 10, -1),
    material: sphereMaterial,
    shape: new Sphere(1),
  });

  // 物理地面
  const groundMaterial = new Material();
  const groundBody = new Body({
    mass: 0, // 质量为0，始终保持静止，不会受到力碰撞或加速度影响
    shape: new Plane(),
    material: groundMaterial,
  });
  groundBody.position.y = -0.5;
  // 改变平面默认的方向，法线默认沿着z轴，旋转到平面向上朝着y方向
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); //旋转规律类似threejs 平面

  // World创建物理世界对象
  const world = new World();
  // 设置物理世界重力加速度
  world.gravity.set(0, -9.8, 0); //单位：m/s²
  world.addBody(body);
  world.addBody(groundBody);

  // 设置地面材质和小球材质之间的碰撞反弹恢复系数
  const contactMaterial = new ContactMaterial(groundMaterial, sphereMaterial, {
    restitution: 0, //反弹恢复系数
  });
  // 把关联的材质添加到物理世界中
  world.addContactMaterial(contactMaterial);

  // 网格小球
  const geometry = new THREE.SphereGeometry(1);
  const material = new THREE.MeshLambertMaterial({
    color: 0xffff00,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 100;

  scene.add(mesh);

  // const stats = new Stats();
  // document.body.appendChild(stats.domElement);
  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.update();
  document.getElementById("webgl")!.appendChild(renderer.domElement);

  // 渲染函数
  function render() {
    // stats.update();
    if (pointerControl.isLocked) {
      console.log("球位置", body.position, groundBody.position);
      world.step(1 / 60); //更新物理计算
      mesh.position.copy(
        new THREE.Vector3(body.position.x, body.position.y, body.position.z)
      );
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
