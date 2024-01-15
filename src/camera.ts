import { PerspectiveCamera } from "three";

class Camera {
  instance;

  constructor(aspect: number) {
    const camera = new PerspectiveCamera(50, aspect, 0.05, 3000);
    //相机在Three.js三维坐标系中的位置
    // 根据需要设置相机位置具体值
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 1);

    this.instance = camera;
  }

  getCamera() {
    return this.instance;
  }
}

export default Camera;
