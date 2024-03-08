import {
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
import { init as initRapier } from "@dimforge/rapier3d-compat";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Camera from "./Camera";
import World from "./World";

const init = async () => {
  const width = window.innerWidth; //窗口文档显示区的宽度作为画布宽度
  const height = window.innerHeight; //窗口文档显示区的高度作为画布高度
  // 创建渲染器对象
  const renderer = new WebGLRenderer({ antialias: true }); // 抗锯齿
  const camera = new Camera(width / height);

  renderer.setPixelRatio(window.devicePixelRatio); //设置设备像素比。通常用于避免HiDPI设备上绘图模糊
  renderer.setSize(width, height); //设置three.js渲染区域的尺寸(像素px)
  renderer.toneMapping = ACESFilmicToneMapping; // 色调映射
  // 在普通计算机显示器或者移动设备屏幕等低动态范围介质上，模拟、逼近高动态范围（HDR）效果
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; // 允许渲染器渲染阴影
  renderer.shadowMap.type = PCFSoftShadowMap;

  await initRapier();
  const world = new World("gltf/de_dust.glb", camera);

  document.getElementById("webgl")!.appendChild(renderer.domElement);

  // 渲染函数
  const render = () => {
    world.render();
    renderer.render(world.scene, camera.getCamera()); //执行渲染操作
    requestAnimationFrame(render); //请求再次执行渲染函数render，渲染下一帧
  };

  await world.load();

  // loading finished
  const loading = document.getElementById("loading")!;
  loading.style.display = "none";
  const instructions = document.getElementById("instructions")!;
  instructions.style.display = "flex";
  render();
};

init();

export default init;
