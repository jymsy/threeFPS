import * as THREE from "three";

class Floor {
  mesh;

  constructor() {
    const geometry = new THREE.PlaneGeometry(40, 40);
    const texLoader = new THREE.TextureLoader();
    const texture = texLoader.load("./img/ground.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(40, 40);
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    // 两个参数分别为几何体geometry、材质material
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;
  }
}

export default Floor;
