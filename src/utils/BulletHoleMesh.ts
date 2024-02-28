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
  Intersection,
} from "three";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";
import State from "../state";

class BulletHoleMesh {
  type: "texture" | "decal";
  geometry: PlaneGeometry;
  material: MeshBasicMaterial;
  bulletDecals: Mesh[] = [];

  constructor(type: "texture" | "decal" = "decal") {
    this.type = type;
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

  create(hitObject: Intersection<Object3D>, scene: Scene) {
    let mesh;
    const position = hitObject.point;
    const normal = hitObject
      .face!.normal.clone()
      .applyEuler(State.worldRotation);
    if (this.type === "decal") {
      const dir = new Object3D();
      dir.lookAt(normal);
      mesh = new Mesh(
        new DecalGeometry(
          hitObject.object as Mesh,
          position,
          dir.rotation,
          new Vector3(1, 1, 1)
        ),
        this.material
      );
    } else {
      mesh = new Mesh(this.geometry, this.material);
      mesh.lookAt(normal);
      mesh.position.copy(position);
    }

    mesh.renderOrder = this.bulletDecals.length;
    this.bulletDecals.push(mesh);
    scene.add(mesh);

    setTimeout(() => {
      const firstHole = this.bulletDecals.shift();
      if (firstHole) {
        scene.remove(firstHole);
      }
    }, 3000);
  }
}

export default BulletHoleMesh;
