import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";
class Gun {
  gltf;
  group;

  constructor(scene) {
    // 创建GLTF加载器对象
    const loader = new GLTFLoader();
    this.group = new THREE.Group();

    loader.load("gltf/gun/scene.gltf", (gltf) => {
      this.gltf = gltf;
      gltf.scene.scale.set(0.1, 0.1, 0.1);
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
        }
      });
      gltf.scene.position.set(-0.1, -0.2, 0.2);
      this.group.add(gltf.scene);
      scene.add(this.group);
    });
  }

  render(camera) {
    if (this.gltf) {
      const cameraObj = camera.getCamera();
      const front = new THREE.Vector3();
      cameraObj.getWorldDirection(front);
      const right = front.clone().cross(cameraObj.up).normalize();
      const down = front.clone().cross(right).normalize();

      this.group.rotation.copy(cameraObj.rotation);
      this.group.rotateY(Math.PI);
      this.group.rotateX(-Math.PI / 6);

      this.group.position.copy(cameraObj.position);
    }
  }
}

export default Gun;
