import { Vector3, Clock, PerspectiveCamera } from "three";

class Camera {
  instance;
  goForward = false;
  goBack = false;
  goRight = false;
  goLeft = false;
  jumping = false;
  speed = 10; //控制器移动速度
  clock = new Clock();
  spaceUp = true;

  velocity = new Vector3(); //移动速度向量
  direction = new Vector3(); //移动的方向向量
  rotation = new Vector3(); //当前的相机朝向

  constructor(aspect: number) {
    // 实例化一个透视投影相机对象
    const camera = new PerspectiveCamera(50, aspect, 0.1, 300);
    //相机在Three.js三维坐标系中的位置
    // 根据需要设置相机位置具体值
    camera.position.set(0, 0, 0);
    // 全屏情况下：设置观察范围长宽比aspect为窗口宽高比
    camera.lookAt(0, 0, -1); //指向mesh对应的位置

    this.instance = camera;
  }

  getCamera() {
    return this.instance;
  }

  handleKeyDown(key: string) {
    switch (key) {
      case "w":
        this.goForward = true;
        break;
      case "s":
        this.goBack = true;
        break;
      case "a":
        this.goLeft = true;
        break;
      case "d":
        this.goRight = true;
        break;
      case " ":
        if (!this.jumping && this.spaceUp) {
          this.velocity.y += 15;
          this.jumping = true;
          this.spaceUp = false;
        }
        break;
      default:
        break;
    }
  }
}

export default Camera;
