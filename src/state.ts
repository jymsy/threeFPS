import { Object3D, Vector3, Euler } from "three";

export type StateType = {
  firstPerson: boolean;
  worldMapMeshes: Object3D[];
  worldScale: Vector3;
  worldRotation: Euler;
};

const state: StateType = {
  firstPerson: false,
  worldMapMeshes: [],
  worldScale: new Vector3(),
  worldRotation: new Euler(),
};

export default state;
