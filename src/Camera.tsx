import * as React from "react";
import styled from "styled-components";
import "tracking";
import "tracking/build/data/face";
import { getStream } from "./lib/camera";

declare const tracking: any;

const Container = styled.div``;

const Video = styled.video``;

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

export class Camera extends React.Component<
  { onFacesDetected: (data: IDetection) => void },
  { videoWidth: number; videoHeight: number }
> {
  public state = {
    videoWidth: 320,
    videoHeight: 240
  };
  private $video: HTMLVideoElement;

  public async componentDidMount() {
    const stream = await getStream();
    const $video = this.$video;

    $video.setAttribute("width", this.state.videoWidth.toString());
    $video.setAttribute("height", this.state.videoHeight.toString());
    $video.setAttribute("autoplay", "true");
    $video.src = window.URL.createObjectURL(stream);

    const tracker = new tracking.ObjectTracker("face") as any;
    tracker.setInitialScale(4);
    tracker.setStepSize(0.5);
    tracker.setEdgesDensity(0.1);
    tracking.track($video, tracker, { camera: true });

    let firstEmptyTime: null | number = 0;

    tracker.on("track", async (event: { data: IFaceRect[] }) => {
      /*
       * Tracking sometimes gives random empty results
       * even when there are faces in the picture
       */

      const noFaces = event.data.length === 0;

      if (firstEmptyTime === null && noFaces) {
        firstEmptyTime = Date.now();
      }

      if (noFaces) {
        const longEnoughWithoutNoFaces =
          noFaces && Date.now() - (firstEmptyTime as number) > 3000;
        if (!longEnoughWithoutNoFaces) {
          return;
        }
      } else {
        firstEmptyTime = null;
      }

      this.props.onFacesDetected({
        amount: event.data.length,
        image: await createFaceImage($video)
      });
    });
  }

  public render() {
    return (
      <Container>
        <Video
          innerRef={($el: HTMLVideoElement) => {
            this.$video = $el;
          }}
        />
      </Container>
    );
  }
}
