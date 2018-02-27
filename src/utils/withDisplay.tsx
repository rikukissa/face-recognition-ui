import * as React from "react";
import { IProps as ICameraProps } from "../components/Camera";

export interface IProps {
  className?: string;
  filter?: (context: CanvasRenderingContext2D) => void;
}

export function withDisplay(
  CameraComponent: React.ComponentClass<ICameraProps>
) {
  return class CameraWithDisplay extends React.Component<IProps, {}> {
    private $canvas: HTMLCanvasElement;
    private mounted: boolean;
    private $video: HTMLVideoElement;

    public async componentDidMount() {
      const $video = this.$video;
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

      this.reflectVideoToCanvas();
    }
    public componentWillUnmount() {
      this.mounted = false;
    }

    private reflectVideoToCanvas = () => {
      if (!this.mounted) {
        return;
      }
      const context = this.$canvas.getContext("2d") as CanvasRenderingContext2D;
      context.drawImage(
        this.$video,
        0,
        0,
        this.$canvas.width,
        this.$canvas.height
      );
      if (
        this.props.filter &&
        this.$canvas.width > 0 &&
        this.$canvas.height > 0
      ) {
        this.props.filter(context);
      }
      window.requestAnimationFrame(this.reflectVideoToCanvas);
    };

    public render() {
      return (
        <div>
          <CameraComponent
            innerRef={($el: HTMLVideoElement) => (this.$video = $el)}
            {...this.props}
          />
          <canvas
            className={this.props.className}
            ref={($el: HTMLCanvasElement) => {
              this.$canvas = $el;
            }}
          />
        </div>
      );
    }
  };
}
