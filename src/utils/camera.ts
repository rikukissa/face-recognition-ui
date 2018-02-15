export function getStream() {
  return new Promise((resolve, reject) => {
    navigator.getUserMedia(
      { video: true, audio: false },
      stream => resolve(stream),
      err => console.log("wya", err.message) || reject(err)
    );
  });
}
