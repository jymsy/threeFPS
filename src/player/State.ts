import {
  Scene,
  Vector3,
  Clock,
  Euler,
  Mesh,
  AnimationMixer,
  Group,
  AnimationAction,
  LoopOnce,
  SkeletonHelper,
  Bone,
  Object3D,
  MathUtils,
  AnimationClip,
} from "three";
import Player from ".";

export enum STATE {
  FORWARD = "forward",
  FORWARD_SHOOT = "forwardShoot",
  FORWARD_LEFT = "forwardLeft",
  FORWARD_RIGHT = "forwardRight",
  BACKWARD = "backward",
  BACKWARD_AIM = "backwardAim",
  BACKWARD_LEFT = "backwardLeft",
  BACKWARD_RIGHT = "backwardRight",
  AIM = "aim",
  LEFT = "left",
  RIGHT = "right",
  JUMP = "jump",
  IDLE = "idle",
  SHOOT = "shoot",
}

type ActionState = {
  name: string;
  action: AnimationAction | null;
};

class State {
  animations: AnimationClip[];
  currentState: ActionState;
  preState: ActionState;
  mixer: AnimationMixer;
  player: Player;

  constructor(animations: AnimationClip[], scene: Group, player: Player) {
    this.animations = animations;
    this.mixer = new AnimationMixer(scene);
    this.player = player;
    this.currentState = { name: "", action: null };
    this.preState = { name: "", action: null };
  }

  playAnimation(name: string) {
    if (this.currentState.name === name) {
      return;
    }
    if (this.currentState.action) {
      this.currentState.action.fadeOut(0.1);
    }
    const clip = AnimationClip.findByName(this.animations, name);
    const action = this.mixer.clipAction(clip);
    if (action) {
      action.reset().fadeIn(0.1).play();
      this.preState = {
        name: this.currentState.name,
        action: this.currentState.action,
      };
      this.currentState = { name, action };
    }
  }
}

export default State;
