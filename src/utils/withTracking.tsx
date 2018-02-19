import * as React from "react";
import "tracking";
import "tracking/build/data/face";
import { IProps } from "../components/Camera";

declare const tracking: any;

export interface IFaceRect {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface IDetection {
  amount: number;
  image: string;
  data: IFaceRect[];
}

function createFaceImage($video: HTMLVideoElement): string {
  const $canvas = document.createElement("canvas");
  $canvas.width = $video.width;
  $canvas.height = $video.height;
  const context = $canvas.getContext("2d") as CanvasRenderingContext2D;
  context.drawImage($video, 0, 0, $canvas.width, $canvas.height);
  return $canvas.toDataURL();
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

interface ITrackingProps {
  trackingStoppedForDebugging: boolean;
  onFacesDetected: (data: IDetection) => void;
}

function trackingJSTracker(
  $source: HTMLVideoElement,
  onDetect: (event: IDetection) => void
) {
  const tracker: any = new tracking.ObjectTracker("face") as any;
  console.log("using tracking.js");

  // Smaller is more precise but slower
  tracker.setStepSize(0.5);

  tracker.setInitialScale(4);
  tracker.setEdgesDensity(0.1);

  const wrapper = tracking.track($source, tracker, {
    camera: false
  });

  const shouldEmit = createThrottler();

  tracker.on("track", async (event: IDetectionEvent) => {
    /*
   * Tracking sometimes gives random empty results
   * even when there are faces in the picture
   */
    if (!shouldEmit(event)) {
      return;
    }

    onDetect({
      amount: event.data.length,
      image: createFaceImage($source),
      data: event.data
    });
  });

  return {
    ...tracker,
    stop: () => {
      wrapper.stop();
      tracker.removeAllListeners("track");
    }
  };
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
  console.log("using chrome");

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
      if (result.length > 0) {
        console.log(result);
      }

      onDetect({
        amount: result.lenght,
        image: createFaceImage($source),
        data: result.map((item: IChromeDetectionItem) => ({
          width: item.boundingBox.width,
          height: item.boundingBox.height,
          y: item.boundingBox.y,
          x: item.boundingBox.x
        }))
      });
      // tslint:disable
    } catch (err) {}
    window.requestAnimationFrame(loop);
  }
  loop();

  return {
    stop: () => {
      stopped = true;
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
        : trackingJSTracker)(this.$video, (event: IDetectionEvent) => {
        /*
       * Tracking sometimes gives random empty results
       * even when there are faces in the picture
       */
        if (this.props.trackingStoppedForDebugging) {
          return;
        }

        this.props.onFacesDetected({
          amount: event.data.length,
          image: createFaceImage(this.$video),
          data: event.data
        });
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
