import { Audio, AudioListener, AudioLoader as ThreeAudioLoader } from "three";
import PointerLockControls from "./PointerLockControls";

class AudioLoader {
  listener;
  soundContainer: Record<string, Audio> = {};

  constructor(pointerControl: PointerLockControls) {
    this.listener = new AudioListener();
    pointerControl.yawObject.add(this.listener);
  }

  load = (name: string, path: string) => {
    return new Promise(async (resolve) => {
      this.soundContainer[name] = new Audio(this.listener);
      const audioLoader = new ThreeAudioLoader();
      audioLoader.load(path, (buffer) => {
        this.soundContainer[name].setBuffer(buffer);
        resolve(1);
      });
    });
  };

  play = (name: string) => {
    if (this.soundContainer[name]) {
      this.soundContainer[name].stop();
      this.soundContainer[name].play();
    }
  };
}

export default AudioLoader;
