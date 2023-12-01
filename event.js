const initEventHandlers = (camera, pointerControl) => {
  const instructions = document.getElementById("instructions");
  const blocker = document.getElementById("blocker");

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

  document.addEventListener("keydown", (ev) => {
    if (pointerControl.isLocked) {
      camera.handleKeyDown(ev.key);
    }
  });

  document.addEventListener("keyup", (ev) => {
    if (pointerControl.isLocked) {
      camera.handleKeyUp(ev.key);
    }
  });
};

export default initEventHandlers;
