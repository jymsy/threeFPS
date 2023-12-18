import * as THREE from "three";

class Floor {
  mesh;

  constructor(width = 40, height = 40) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const texLoader = new THREE.TextureLoader();
    const texture = texLoader.load("./img/ground.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(width, height);
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
