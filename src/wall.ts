import * as THREE from "three";

class Wall {
  mesh;

  constructor() {
    // const indices = [
    //   // 下面索引值对应顶点位置数据中的顶点坐标
    //   0, 1, 2, 2, 3, 0,
    // ];
    // const uvs = new Float32Array([
    //   0,
    //   0, //图片左下角
    //   1,
    //   0, //图片右下角
    //   1,
    //   1, //图片右上角
    //   0,
    //   1, //图片左上角
    // ]);
    // const geometry = new THREE.BufferGeometry();
    // const attribute = new THREE.BufferAttribute(new Float32Array(vertex), 3);
    // geometry.setIndex(indices);
    // geometry.setAttribute("position", attribute);
    // geometry.attributes.uv = new THREE.BufferAttribute(uvs, 2);
    // geometry.computeVertexNormals();

    const geometry = new THREE.PlaneGeometry(4, 1);
    const texLoader = new THREE.TextureLoader();
    const texture = texLoader.load("./img/wall.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    // 两个参数分别为几何体geometry、材质material
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }
}

export default Wall;