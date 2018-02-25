export function getStream() {
  const constraints = { video: { facingMode: "user" } };
  return navigator.mediaDevices.getUserMedia(constraints);
}
