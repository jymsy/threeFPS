export default interface IInputListener {
  handleKeyDown?: (key: string) => void;
  handleKeyUp?: (key: string) => void;
  handleMouseMove?: (event: MouseEvent) => void;
}
