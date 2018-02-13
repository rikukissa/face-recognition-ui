import * as React from "react";
import styled from "styled-components";
import "tracking";
import "tracking/build/data/face";
import { getStream } from "./lib/camera";

declare const tracking: any;

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
`;

const Video = styled.video`
  position: absolute;
  top: -240px;
  left: -320px;
`;
const Canvas = styled.canvas`
  width: 100%;
  position: absolute;
  bottom: 0;
`;

export interface IFaceRect {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface IDetection {
  amount: number;
  image: Blob;
}

function createFaceImage($video: HTMLVideoElement): Promise<Blob> {
  const $canvas = document.createElement("canvas");
  $canvas.width = $video.videoWidth;
  $canvas.height = $video.videoHeight;
  const context = $canvas.getContext("2d") as CanvasRenderingContext2D;
  context.drawImage($video, 0, 0, $canvas.width, $canvas.height);
  return new Promise((resolve, reject) =>
    $canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error("No image")))
    )
  );
}

interface IDetectionEvent {
  data: IFaceRect[];
}

function createThrottler() {
  let firstEmptyTime: null | number = 0;
  return function shouldEmit(event: IDetectionEvent) {
    const noFaces = event.data.length === 0;

    if (firstEmptyTime === null && noFaces) {
      firstEmptyTime = Date.now();
    }

    if (noFaces) {
      const longEnoughWithoutNoFaces =
        noFaces && Date.now() - (firstEmptyTime as number) > 3000;
      if (!longEnoughWithoutNoFaces) {
        return false;
      }
    } else {
      firstEmptyTime = null;
    }
    return true;
  };
}

export class Camera extends React.Component<
  { onFacesDetected: (data: IDetection) => void },
  {}
> {
  private $video: HTMLVideoElement;
  private $canvas: HTMLCanvasElement;

  public async componentDidMount() {
    const stream = await getStream();

    this.$video.setAttribute("width", "320");
    this.$video.setAttribute("height", "240");
    this.$video.setAttribute("autoplay", "true");
    this.$video.src = window.URL.createObjectURL(stream);

    this.$canvas.setAttribute("width", "320");
    this.$canvas.setAttribute("height", "240");

    const tracker = new tracking.ObjectTracker("face") as any;

    // Smaller is more precise but slower
    tracker.setStepSize(0.5);

    tracker.setInitialScale(4);
    tracker.setEdgesDensity(0.1);
    tracking.track(this.$video, tracker, { camera: true });

    const shouldEmit = createThrottler();

    tracker.on("track", async (event: IDetectionEvent) => {
      /*
       * Tracking sometimes gives random empty results
       * even when there are faces in the picture
       */
      if (!shouldEmit(event)) {
        return;
      }

      this.props.onFacesDetected({
        amount: event.data.length,
        image: await createFaceImage(this.$video)
      });
    });

    this.reflectVideoToCanvas();
  }

  /*
   * The reason I'm not just stretching the video is, that it would make
   * the face detection much slower
   * More pixels = more surfice to look for the face
   */
  private reflectVideoToCanvas = () => {
    const context = this.$canvas.getContext("2d") as CanvasRenderingContext2D;
    context.drawImage(
      this.$video,
      0,
      0,
      this.$canvas.width,
      this.$canvas.height
    );
    window.requestAnimationFrame(this.reflectVideoToCanvas);
  };

  public render() {
    return (
      <Container>
        <Video
          innerRef={($el: HTMLVideoElement) => {
            this.$video = $el;
          }}
        />
        <Canvas
          innerRef={($el: HTMLCanvasElement) => {
            this.$canvas = $el;
          }}
        />
      </Container>
    );
  }
}
