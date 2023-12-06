import * as THREE from "three";

class Camera {
  instance;
  goForward = false;
  goBack = false;
  goRight = false;
  goLeft = false;
  jumping = false;
  speed = 10; //控制器移动速度
  clock = new THREE.Clock();
  spaceUp = true;

  velocity = new THREE.Vector3(); //移动速度向量
  direction = new THREE.Vector3(); //移动的方向向量
  rotation = new THREE.Vector3(); //当前的相机朝向

  constructor(aspect) {
    // 实例化一个透视投影相机对象
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 300);
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

  handleKeyDown(key) {
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

  handleKeyUp(key) {
    switch (key) {
      case "w":
        this.goForward = false;
        break;
      case "s":
        this.goBack = false;
        break;
      case "a":
        this.goLeft = false;
        break;
      case "d":
        this.goRight = false;
        break;
      case " ":
        this.spaceUp = true;
      default:
        break;
    }
  }

  render(pointerControl) {
    const delta = this.clock.getDelta();
    const object = pointerControl.getObject();

    // 增加惯性效果
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;
    this.velocity.y -= 9.8 * 10.0 * delta;

    //获取当前按键的方向并获取朝哪个方向移动
    this.direction.z = Number(this.goForward) - Number(this.goBack);
    this.direction.x = Number(this.goRight) - Number(this.goLeft);
    //将法向量的值归一化
    this.direction.normalize();

    if (this.goForward || this.goBack) {
      this.velocity.z -= this.direction.z * this.speed * delta;
    }
    if (this.goLeft || this.goRight) {
      this.velocity.x -= this.direction.x * this.speed * delta;
    }

    // x = x * 0.83
    // x = x - 6.8

    pointerControl.moveForward(-this.velocity.z * delta);
    pointerControl.moveRight(-this.velocity.x * delta);
    object.position.y += this.velocity.y * delta;

    if (object.position.y < 0) {
      this.velocity.y = 0;
      object.position.y = 0;
      this.jumping = false;
    }
  }
}

export default Camera;
