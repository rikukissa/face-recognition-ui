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

export function withTracking(WrappedComponent: React.ComponentClass<IProps>) {
  return class ComponentWithTracking extends React.Component<
    ITrackingProps,
    {}
  > {
    private tracker: any;
    private tracking: any;
    private $video: HTMLVideoElement;

    public async componentDidMount() {
      this.tracker = new tracking.ObjectTracker("face") as any;

      // Smaller is more precise but slower
      this.tracker.setStepSize(0.5);

      this.tracker.setInitialScale(4);
      this.tracker.setEdgesDensity(0.1);
      this.tracking = tracking.track(this.$video, this.tracker, {
        camera: false
      });

      const shouldEmit = createThrottler();

      this.tracker.on("track", async (event: IDetectionEvent) => {
        /*
       * Tracking sometimes gives random empty results
       * even when there are faces in the picture
       */
        if (!shouldEmit(event) || this.props.trackingStoppedForDebugging) {
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
      this.tracking.stop();
      this.tracker.removeAllListeners("track");
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
