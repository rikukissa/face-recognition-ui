export function getStream() {
  const constraints = { video: { facingMode: "environment" } };
  return navigator.mediaDevices.getUserMedia(constraints);
}
