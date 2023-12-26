import PointerLockControlsCannon from "./utils/pointerLockControlsCannon";

const initEventHandlers = (pointerControl: PointerLockControlsCannon) => {
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
};

export default initEventHandlers;
