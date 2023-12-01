import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";
class Gun {
  gltf;

  constructor(scene) {
    // 创建GLTF加载器对象
    const loader = new GLTFLoader();

    loader.load("gltf/gun/scene.gltf", (gltf) => {
      this.gltf = gltf;
      gltf.scene.scale.set(0.1, 0.1, 0.1);
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
        }
      });
      scene.add(gltf.scene);
    });
  }

  render(camera) {
    if (this.gltf) {
      const cameraObj = camera.getCamera();
      const front = new THREE.Vector3();
      cameraObj.getWorldDirection(front);
      const right = front.clone().cross(cameraObj.up).normalize();
      const down = front.clone().cross(right).normalize();

      this.gltf.scene.rotation.copy(cameraObj.rotation);
      this.gltf.scene.rotateY(Math.PI);
      this.gltf.scene.rotateX(-Math.PI / 6);

      this.gltf.scene.position
        .copy(cameraObj.position)
        .add(front.multiplyScalar(0.4))
        .add(right.multiplyScalar(0.2))
        .add(down.multiplyScalar(0.15));
    }
  }
}

export default Gun;
