const isSpeechAvailable = () => "speechSynthesis" in window;

// say something
export const sayShit = (text: string) => {
  return new Promise((resolve, reject) => {
    if (!isSpeechAvailable) {
      return reject("Speech synthesis not available");
    }
    const msg = new SpeechSynthesisUtterance();
    const voices = window.speechSynthesis.getVoices();
    msg.voice = voices[10]; // Note: some voices don't support altering params
    msg.volume = 1; // 0 to 1
    msg.rate = 1; // 0.1 to 10
    msg.pitch = 2; // 0 to 2
    msg.text = text;
    msg.lang = "en-GB";

    speechSynthesis.speak(msg);

    msg.onend = event => {
      resolve();
    };
  });
};
