const DEFAULT_COUNT = 30;

class BulletStore {
  static element: HTMLElement;
  static count = DEFAULT_COUNT;

  static init() {
    this.element = document.getElementById("bullet-num")!;
    this.element.innerText = `${DEFAULT_COUNT}`;
  }

  static decrease() {
    this.count = Math.max(this.count - 1, 0);
    this.element.innerText = `${this.count}`;
  }

  static reload() {
    this.count = DEFAULT_COUNT;
    this.element.innerText = `${this.count}`;
  }
}

export default BulletStore;
