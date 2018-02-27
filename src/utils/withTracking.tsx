import * as React from "react";
import { IProps } from "../components/Camera";
import { connectWebsocket } from "../lib/api";

export interface IFaceRect {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface IDetection {
  amount: number;
  image: ImageData;
  data: IFaceRect[];
}

function createFaceImageData($video: HTMLVideoElement): ImageData {
  const $canvas = document.createElement("canvas");
  $canvas.width = $video.width;
  $canvas.height = $video.height;
  const context = $canvas.getContext("2d") as CanvasRenderingContext2D;
  context.drawImage($video, 0, 0, $canvas.width, $canvas.height);
  return context.getImageData(0, 0, $canvas.width, $canvas.height);
}

interface ITrackingProps {
  trackingStoppedForDebugging: boolean;
  onFacesDetected: (data: IDetection) => void;
}

interface IChromeDetectionItem {
  boundingBox: {
    x: number;
    y: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
  landmarks: Array<{
    location: { x: number; y: number };
    type: string;
  }>;
}

function chromeExperimentalTracker(
  $source: HTMLVideoElement,
  onDetect: (event: IDetection) => void
) {
  console.log("Using Chrome FaceDetector");

  const faceDetector = new (window as any).FaceDetector({
    maxDetectedFaces: 10,
    fastMode: true
  });

  let stopped = false;

  async function loop() {
    if (stopped) {
      return;
    }
    try {
      const result = await faceDetector.detect($source);

      if (stopped) {
        // Stopped while still trying to detect something
        return;
      }

      onDetect({
        amount: result.length,
        image: createFaceImageData($source),
        data: result.map((item: IChromeDetectionItem) => ({
          width: item.boundingBox.width,
          height: item.boundingBox.height,
          y: item.boundingBox.y,
          x: item.boundingBox.x
        }))
      });
      // tslint:disable
    } catch (err) {
      // console.log(err);
    }

    setTimeout(() => {
      window.requestAnimationFrame(loop);
    }, 300);
  }
  loop();

  return {
    stop: () => {
      stopped = true;
    }
  };
}

function websocketTracker(
  $source: HTMLVideoElement,
  onDetect: (event: IDetection) => void
) {
  console.log("Using Websocket detector");

  const ws = connectWebsocket();

  function detect($video: HTMLVideoElement): Promise<IDetection> {
    const imageData = createFaceImageData($video);

    return new Promise(resolve => {
      function listener(event: any) {
        ws.removeEventListener("message", listener);
        const data = JSON.parse(event.data);

        return resolve({
          amount: data.objects.length,
          image: imageData,
          data: data.objects
        });
      }

      ws.addEventListener("message", listener);

      const buffer = new Uint8Array(4 + imageData.data.length);

      buffer.set([
        (imageData.width >> 8) & 0xff,
        (imageData.width >> 0) & 0xff,
        (imageData.height >> 8) & 0xff,
        (imageData.height >> 0) & 0xff
      ]);

      buffer.set(imageData.data, 4);

      ws.send(buffer);
    });
  }

  let stopped = false;

  async function loop() {
    if (stopped) {
      return;
    }

    onDetect(await detect($source));
    setTimeout(() => {
      window.requestAnimationFrame(loop);
    }, 500);
  }
  ws.addEventListener("open", function open() {
    loop();
  });

  return {
    stop: () => {
      stopped = true;
      ws.close();
    }
  };
}

export function withTracking(WrappedComponent: React.ComponentClass<IProps>) {
  return class ComponentWithTracking extends React.Component<
    ITrackingProps,
    {}
  > {
    private tracker: any;
    private $video: HTMLVideoElement;

    public async componentDidMount() {
      this.tracker = ((window as any).FaceDetector
        ? chromeExperimentalTracker
        : websocketTracker)(this.$video, (event: IDetection) => {
        /*
       * Tracking sometimes gives random empty results
       * even when there are faces in the picture
       */
        if (this.props.trackingStoppedForDebugging) {
          return;
        }

        this.props.onFacesDetected(event);
      });
    }
    public componentWillUnmount() {
      this.tracker.stop();
    }

    public render() {
      return (
        <WrappedComponent
          innerRef={($el: HTMLVideoElement) => (this.$video = $el)}
          {...this.props}
        />
      );
    }
  };
}
