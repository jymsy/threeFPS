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
  RUN = "pistolRun",
  BACK = "pistolBack",
  LEFT = "pistolLeft",
  RIGHT = "pistolRight",
  JUMP = "pistolJump",
  IDLE = "pistolIdle",
}

class State {
  animations: AnimationClip[];
  currentState: string = "";
  currentAction?: AnimationAction;
  mixer: AnimationMixer;
  player: Player;

  constructor(animations: AnimationClip[], scene: Group, player: Player) {
    this.animations = animations;
    this.mixer = new AnimationMixer(scene);
    this.player = player;
  }

  playAnimation(name: string) {
    if (this.currentState === name) {
      return;
    }
    let animationName = name;
    if (this.player.moveVelocity.length() === 0) {
      // 同时按住前进后退
      animationName = STATE.IDLE;
      if (this.currentState === animationName) {
        return;
      }
    }
    if (this.currentAction) {
      this.currentAction.fadeOut(0.1);
    }
    const clip = AnimationClip.findByName(this.animations, animationName);
    const action = this.mixer.clipAction(clip);
    if (action) {
      action.reset().fadeIn(0.1).play();
      this.currentState = animationName;
      this.currentAction = action;
    }
  }
}

export default State;
