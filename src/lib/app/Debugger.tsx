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
  width: 100%;
  background: #000;
`;

const DebugFaceBuffer = styled.div`
  display: flex;
`;

const DebugBufferFrame = styled.div.attrs<{
  rect: IFaceRect;
  image: string;
}>({
  style: ({ image, rect }: { image: string; rect: IFaceRect }) => ({
    width: `${rect.width + 60}px`,
    height: `${rect.height + 60}px`,
    backgroundImage: `url(${image})`,
    backgroundPosition: `-${rect.x - 30}px -${rect.y - 30}px`
  })
})`
  display: inline-block;
`;

const DebugCameraContainer = styled.div`
  display: flex;
  justify-content: center;
`;
const DebugCamera = styled.div`
  position: relative;
`;

const DebugFooter = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
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

class DebuggerComponent extends React.Component<IProps & IDispatchProps> {
  public render() {
    if (!this.props.latestDetection) {
      return <div />;
    }

    return (
      <Debug>
        <DebugCameraContainer>
          <DebugCamera>
            <img src={imageDataToURL(this.props.latestDetection.image)} />
            {this.props.latestDetection.data.map((rect, i) => (
              <DebugSquare
                {...rect}
                firstDetected={rect === this.props.firstFaceDetected}
                key={i}
              />
            ))}
            <DebugFooter>
              {this.props.latestDetection.amount} faces
              <button onClick={this.props.toggleTracking}>
                {this.props.trackingStoppedForDebugging
                  ? "resume tracking"
                  : "pause tracking"}
              </button>
            </DebugFooter>
          </DebugCamera>
        </DebugCameraContainer>
        <DebugFaceBuffer>
          {this.props.faceBuffer.map((bufferItem: IBufferedDetection, i) => (
            <DebugBufferFrame
              key={i}
              rect={bufferItem.rect}
              image={imageDataToURL(bufferItem.image)}
            />
          ))}
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
