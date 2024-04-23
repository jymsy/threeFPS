import PointerLockControls from "./utils/PointerLockControls";
import Player from "./player";

class MiniMap {
  cursor;
  pointerControl;
  player;
  map;

  constructor(pointerControl: PointerLockControls, player: Player) {
    this.cursor = document.getElementById("cursor");
    this.map = document.getElementById("map");
    this.pointerControl = pointerControl;
    this.player = player;
  }

  rotateCursor = (rotation: number) => {
    this.cursor!.style.transform = `rotate(${rotation}rad)`;
  };

  render = () => {
    this.cursor!.style.transform = `rotate(${-this.pointerControl.euler.y}rad)`;
  };
}

export default MiniMap;
