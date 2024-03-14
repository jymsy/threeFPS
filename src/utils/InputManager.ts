import IInputListener from "../interfaces/IInputListener";
import PointerLockControls from "./PointerLockControls";

export default class InputManager {
  inputListeners: IInputListener[] = [];
  pointerLockControls;

  constructor(pointerControl: PointerLockControls) {
    this.pointerLockControls = pointerControl;
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  register = (listener: IInputListener) => {
    this.inputListeners.push(listener);
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.pointerLockControls.enabled) {
      return;
    }
    this.inputListeners.forEach((listener) => {
      listener.handleKeyDown?.(event.key);
    });
  };

  handleKeyUp = (event: KeyboardEvent) => {
    if (!this.pointerLockControls.enabled) {
      return;
    }
    this.inputListeners.forEach((listener) => {
      listener.handleKeyUp?.(event.key);
    });
  };
}
