import * as React from "react";
import styled from "styled-components";
import { IState } from "./logic";
import {
  IState as IRecognitionState,
  IBufferedDetection,
  toggleTracking
} from "../recognition/logic";
import { IApplicationState } from "../../store";
import { getBestImageFromBuffer } from "../recognition/utils";
import { connect } from "react-redux";
import { IFaceRect } from "../../utils/withTracking";
import { imageDataToURL } from "../../utils/image";

const Debug = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
`;

const DebugFaceBuffer = styled.div`
  display: flex;
  align-content: flex-start;
  flex-wrap: wrap;
`;
const OUTPUT_HEIGHT = 200;
const BUFFER_OUTPUT_HEIGHT = 100;

const DebugImage = styled.img`
  height: ${OUTPUT_HEIGHT}px;
`;

const DebugBufferFrame = styled.div.attrs<{
  rect: IFaceRect;
  image: ImageData;
  scale: number;
}>({
  style: ({
    image,
    rect,
    scale
  }: {
    image: ImageData;
    rect: IFaceRect;
    scale: number;
  }) => ({
    height: `${BUFFER_OUTPUT_HEIGHT}px`,
    width: `${rect.width}px`,
    backgroundImage: `url(${imageDataToURL(image)})`,
    backgroundSize: `auto ${image.height * scale}px`,
    backgroundPosition: `-${rect.x}px -${rect.y}px`
  })
})`
  display: inline-block;
`;

const DebugCamera = styled.div`
  position: relative;
`;

const DebugHeader = styled.div`
  padding: 1em;
  background: #fff;
`;

const DebugSquare = styled.div.attrs<{
  width: number;
  height: number;
  x: number;
  y: number;
  firstDetected: boolean;
}>({
  style: ({
    width,
    height,
    x,
    y
  }: {
    width: number;
    height: number;
    x: number;
    y: number;
  }) => ({
    width: `${width}px`,
    height: `${height}px`,
    left: `${x}px`,
    top: `${y}px`
  })
})`
  position: absolute;
  border: 1px solid ${({ firstDetected }) => (firstDetected ? "red" : "#fff")};
`;

export interface IProps {
  latestRecognitionCandidate: null | IBufferedDetection;
  isAwake: IState["isAwake"];
  latestDetection: IRecognitionState["latestDetection"];
  trackingStoppedForDebugging: IRecognitionState["trackingStoppedForDebugging"];
  faceBuffer: IRecognitionState["faceBuffer"];
  firstFaceDetected: IRecognitionState["firstFaceDetected"];
}

export interface IDispatchProps {
  toggleTracking: () => void;
}

function scaleRect(rect: IFaceRect, scale: number) {
  return {
    x: rect.x * scale,
    y: rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale
  };
}

class DebuggerComponent extends React.Component<IProps & IDispatchProps> {
  private renderDebugCamera() {
    const { latestDetection } = this.props;
    if (!latestDetection) {
      return <div />;
    }

    const scale = OUTPUT_HEIGHT / latestDetection.image.height;

    return (
      <DebugCamera>
        <DebugImage src={imageDataToURL(latestDetection.image)} />
        {latestDetection.data.map((rect, i) => (
          <DebugSquare
            {...scaleRect(rect, scale)}
            firstDetected={rect === this.props.firstFaceDetected}
            key={i}
          />
        ))}
      </DebugCamera>
    );
  }
  public render() {
    const { faceBuffer, latestDetection } = this.props;

    return (
      <Debug>
        <DebugHeader>
          <strong>{latestDetection ? latestDetection.amount : 0}</strong> faces
          currently detected<br />
          <strong>{faceBuffer.length}</strong> faces in buffer
          <br />
          <br />
          <button onClick={this.props.toggleTracking}>
            {this.props.trackingStoppedForDebugging
              ? "resume tracking"
              : "pause tracking"}
          </button>
        </DebugHeader>

        {this.renderDebugCamera()}

        <DebugFaceBuffer>
          {faceBuffer.map((bufferItem: IBufferedDetection, i) => {
            const scale = BUFFER_OUTPUT_HEIGHT / bufferItem.rect.height;
            return (
              <DebugBufferFrame
                key={i}
                scale={scale}
                rect={scaleRect(bufferItem.rect, scale)}
                image={bufferItem.image}
              />
            );
          })}
        </DebugFaceBuffer>
      </Debug>
    );
  }
}
function mapStateToProps(state: IApplicationState) {
  return {
    isAwake: state.app.isAwake,
    faceBuffer: state.recognition.faceBuffer,
    latestDetection: state.recognition.latestDetection,
    latestRecognitionCandidate: getBestImageFromBuffer(
      state.recognition.faceBuffer
    ),
    trackingStoppedForDebugging: state.recognition.trackingStoppedForDebugging,
    firstFaceDetected: state.recognition.firstFaceDetected
  };
}

export const Debugger = connect<IProps, IDispatchProps>(mapStateToProps, {
  toggleTracking
})(DebuggerComponent);
