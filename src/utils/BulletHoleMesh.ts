import {
  Scene,
  Vector3,
  Group,
  PlaneGeometry,
  TextureLoader,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  Object3D,
  MeshLambertMaterial,
  Euler,
  DoubleSide,
  Color,
} from "three";
import State from "../state";

class BulletHoleMesh {
  geometry: PlaneGeometry;
  material: MeshBasicMaterial;

  constructor() {
    const texLoader = new TextureLoader();
    const bulletHole = texLoader.load("./img/bullet-hole.png");
    this.material = new MeshLambertMaterial({
      map: bulletHole,
      transparent: true, // https://blog.csdn.net/qq_34568700/article/details/130972510
      depthWrite: false, // 后面的弹孔覆盖前面的
      polygonOffset: true, // 深度冲突
      polygonOffsetFactor: -4,
    });

    this.geometry = new PlaneGeometry(1, 1);
  }

  create(position: Vector3, normal: Vector3) {
    const mesh = new Mesh(this.geometry, this.material);
    normal.applyEuler(State.worldRotation);
    mesh.lookAt(normal);
    mesh.position.copy(position);
    return mesh;
  }
}

export default BulletHoleMesh;
