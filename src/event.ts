import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import Camera from "./camera";
import Gun from "./gun";
import Player from "./player";
import PointerLockControlsCannon from "./utils/pointerLockControlsCannon";

const initEventHandlers = (
  camera: Camera,
  pointerControl: PointerLockControlsCannon,
  gun: Gun,
  player: Player
) => {
  const instructions = document.getElementById("instructions")!;
  const blocker = document.getElementById("blocker")!;

  instructions.addEventListener("click", () => {
    pointerControl.lock();
  });

  pointerControl.addEventListener("lock", () => {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });

  pointerControl.addEventListener("unlock", () => {
    blocker.style.display = "block";
    instructions.style.display = "";
  });

  // document.addEventListener("keydown", (ev) => {
  //   if (pointerControl.isLocked) {
  //     camera.handleKeyDown(ev.key);
  //     player.handleKeyDown(ev.key);
  //   }
  // });

  // document.addEventListener("keyup", (ev) => {
  //   if (pointerControl.isLocked) {
  //     camera.handleKeyUp(ev.key);
  //   }
  // });

  document.addEventListener("mousedown", (ev) => {
    if (pointerControl.enabled) {
      gun.handleMouseDown(ev.button);
    }
  });

  document.addEventListener("mouseup", (ev) => {
    if (pointerControl.enabled) {
      gun.handleMouseUp(ev.button);
    }
  });
};

export default initEventHandlers;
