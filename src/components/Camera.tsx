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

if (DEBUG) {
  $video.src = "./seinfeld.webm";
  $video.setAttribute("loop", "false");
} else {
  getStream().then(stream => {
    $video.src = window.URL.createObjectURL(stream);
  });
}

export interface IProps {
  innerRef?: ($el: HTMLVideoElement) => void;
  className?: string;
}

export class Camera extends React.Component<IProps, {}> {
  private $canvas: HTMLCanvasElement;
  private mounted: boolean;

  public async componentDidMount() {
    this.mounted = true;
    $video.addEventListener(
      "loadedmetadata",
      e => {
        this.$canvas.setAttribute("width", $video.videoWidth.toString());
        this.$canvas.setAttribute("height", $video.videoHeight.toString());
      },
      false
    );

    this.$canvas.setAttribute("width", $video.videoWidth.toString());
    this.$canvas.setAttribute("height", $video.videoHeight.toString());

    if (this.props.innerRef) {
      this.props.innerRef($video);
    }

    this.reflectVideoToCanvas();
  }
  public componentWillUnmount() {
    this.mounted = false;
  }
  /*
   * The reason I'm not just stretching the video is, that it would make
   * the face detection much slower
   * More pixels = more surface to look for the face
   */
  private reflectVideoToCanvas = () => {
    if (!this.mounted) {
      return;
    }
    const context = this.$canvas.getContext("2d") as CanvasRenderingContext2D;
    context.drawImage($video, 0, 0, this.$canvas.width, this.$canvas.height);
    window.requestAnimationFrame(this.reflectVideoToCanvas);
  };

  public render() {
    return (
      <canvas
        className={this.props.className}
        ref={($el: HTMLCanvasElement) => {
          this.$canvas = $el;
        }}
      />
    );
  }
}
