import {
  AnimationMixer,
  AnimationAction,
  Object3D,
  AnimationClip,
  LoopOnce,
} from "three";

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
  animations: Record<string, AnimationAction> = {};
  currentState: ActionState;
  preState: ActionState;
  mixer: AnimationMixer;

  constructor(
    animations: AnimationClip[],
    scene: Object3D,
    loopOnces: string[] = [],
    finishCallback?: (name: string) => void
  ) {
    this.mixer = new AnimationMixer(scene);
    this.currentState = { name: "", action: null };
    this.preState = { name: "", action: null };

    animations.forEach((animation) => {
      const name = animation.name;
      const clipAction = this.mixer.clipAction(animation);
      if (loopOnces.includes(name)) {
        clipAction.loop = LoopOnce;
        clipAction.clampWhenFinished = true;
      }
      this.animations[name] = clipAction;
    });

    this.mixer.addEventListener("finished", (event) => {
      const clip = (event.action as AnimationAction).getClip();
      if (finishCallback) {
        finishCallback(clip.name);
      }
    });
  }

  playAnimation(name: string) {
    if (this.currentState.name === name) {
      return;
    }
    if (this.currentState.action) {
      this.currentState.action.fadeOut(0.1);
    }
    // const clip = AnimationClip.findByName(this.animations, name);
    // const action = this.mixer.clipAction(clip);
    const action = this.animations[name];
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
