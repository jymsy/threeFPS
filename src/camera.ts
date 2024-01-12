import { PerspectiveCamera } from "three";

class Camera {
  instance;

  constructor(aspect: number) {
    // 实例化一个透视投影相机对象
    const camera = new PerspectiveCamera(50, aspect, 0.05, 300);
    //相机在Three.js三维坐标系中的位置
    // 根据需要设置相机位置具体值
    camera.position.set(0, 0, 0);
    // 全屏情况下：设置观察范围长宽比aspect为窗口宽高比
    camera.lookAt(0, 0, 1); //指向mesh对应的位置

    this.instance = camera;
  }

  getCamera() {
    return this.instance;
  }
}

export default Camera;
