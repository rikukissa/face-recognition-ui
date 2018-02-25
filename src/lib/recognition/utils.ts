import { IBufferedDetection } from "./logic";

export function getBestImageFromBuffer(buffer: IBufferedDetection[]) {
  return buffer[Math.floor(buffer.length / 2)];
}
