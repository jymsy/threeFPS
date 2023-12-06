import { Scene, AmbientLight, DirectionalLight, CameraHelper } from "three";

const initLight = (scene: Scene) => {
  // // 环境光。没有特定方向，只是整体改变场景的光照明暗。
  const ambient = new AmbientLight(0xffffff, 1.4);
  scene.add(ambient);
  // 平行光
  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.set(8, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(2048, 2048);
  scene.add(directionalLight);

  // 设置三维场景计算阴影的范围
  // directionalLight.shadow.camera.left = -50;
  // directionalLight.shadow.camera.right = 50;
  // directionalLight.shadow.camera.top = 200;
  // directionalLight.shadow.camera.bottom = -100;
  // directionalLight.shadow.camera.near = 0.5;
  // directionalLight.shadow.camera.far = 600;

  // 可视化平行光阴影对应的正投影相机对象
  const cameraHelper = new CameraHelper(directionalLight.shadow.camera);
  scene.add(cameraHelper);
};

export default initLight;
