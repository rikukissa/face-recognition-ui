import * as React from "react";
import { getStream } from "../utils/camera";
import { DEBUG } from "../utils/config";

const VIDEO_WIDTH = 320;
const VIDEO_HEIGHT = 240;

const $video = document.createElement("video");
document.body.appendChild($video);

$video.setAttribute("width", VIDEO_WIDTH.toString());
$video.setAttribute("height", VIDEO_HEIGHT.toString());
$video.setAttribute("autoplay", "true");

$video.setAttribute(
  "style",
  `
  position:fixed;
  top: -${VIDEO_HEIGHT}px;
  left: -${VIDEO_WIDTH}px;
`
);
$video.addEventListener(
  "loadedmetadata",
  function(e) {
    $video.setAttribute("width", this.videoWidth.toString());
    $video.setAttribute("height", this.videoHeight.toString());
    $video.setAttribute(
      "style",
      `
    position:fixed;
    top: -${this.videoHeight}px;
    left: -${this.videoWidth}px;
  `
    );
  },
  false
);

if (!DEBUG) {
  $video.src = "./sample2.mp4";
  $video.setAttribute("loop", "false");
} else {
  getStream().then(stream => {
    $video.srcObject = stream;
  });
}

export interface IProps {
  innerRef?: ($el: HTMLVideoElement) => void;
}

export class Camera extends React.Component<IProps, {}> {
  public async componentDidMount() {
    if (this.props.innerRef) {
      this.props.innerRef($video);
    }
  }

  public render() {
    return <div />;
  }
}
