import PointerLockControls from "./utils/PointerLockControls";
import Player from "./player";

class MiniMap {
  cursor;
  pointerControl;
  player;
  map;
  mapPosition = [165, 435];

  constructor(pointerControl: PointerLockControls, player: Player) {
    this.cursor = document.getElementById("cursor");
    this.map = document.getElementById("map");
    this.pointerControl = pointerControl;
    this.player = player;
  }

  render = () => {
    this.cursor!.style.transform = `rotate(${-this.pointerControl.euler.y}rad)`;
    const deltaX = this.player.model!.position.x - this.player.initPosition.x;
    const deltaY = this.player.model!.position.z - this.player.initPosition.z;
    const mapPositionX = 100 - (deltaX * 7.115 + this.mapPosition[0]);
    const mapPositionY = 100 - (deltaY * 7.115 + this.mapPosition[1]);
    this.map!.style.backgroundPosition = `${mapPositionX}px ${mapPositionY}px`;
  };
}

export default MiniMap;
