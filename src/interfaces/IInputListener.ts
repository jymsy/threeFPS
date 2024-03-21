export default interface IInputListener {
  handleKeyDown?: (key: string, event: KeyboardEvent) => void;
  handleKeyUp?: (key: string, event: KeyboardEvent) => void;
  handleMouseMove?: (event: MouseEvent) => void;
}
