import * as React from "react";
import styled from "styled-components";
import { Camera } from "../../components/Camera";
import { IState } from "./logic";
import { IState as IRecognitionState } from "../recognition/logic";
import { WhoIsThis } from "./views/WhoIsThis";
import { IDetection, withTracking } from "../../utils/withTracking";
import { DEBUG } from "../../utils/config";

const Container = styled.div`
  position: relative;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #abffab;
`;

const Debug = styled.div`
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 2;
  display: flex;
`;
const DebugFaceBuffer = styled.div``;

const DebugBufferFrame = styled.img`
  width: 120px;
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
  currentlyRecognized: null | string;
  latestRecognitionCandidate: null | string;
  currentView: IState["currentView"];
  latestDetection: IRecognitionState["latestDetection"];
  faceBuffer: IRecognitionState["faceBuffer"];
  trackingStoppedForDebugging: IRecognitionState["trackingStoppedForDebugging"];
  firstFaceDetected: IRecognitionState["firstFaceDetected"];
}

export interface IDispatchProps {
  facesDetected: (event: IDetection) => void;
  submitFace: (name: string) => void;
  toggleTracking: () => void;
}

const TrackingCamera = withTracking(Camera);

export class App extends React.Component<IProps & IDispatchProps> {
  private submitFace = (name: string) => {
    this.props.submitFace(name);
  };

  public render() {
    return (
      <Container>
        {this.props.currentView === "home" && (
          <div>
            <h1>index</h1>
            <TrackingCamera
              onFacesDetected={this.props.facesDetected}
              trackingStoppedForDebugging={
                this.props.trackingStoppedForDebugging
              }
            />
          </div>
        )}

        {this.props.currentView === "dashboard" && (
          <Overlay>
            <TrackingCamera
              onFacesDetected={this.props.facesDetected}
              trackingStoppedForDebugging={
                this.props.trackingStoppedForDebugging
              }
            />
            <h1>{this.props.currentlyRecognized}</h1>
          </Overlay>
        )}
        {this.props.currentView === "who is this" &&
          this.props.latestRecognitionCandidate && (
            <WhoIsThis
              onSave={this.submitFace}
              image={this.props.latestRecognitionCandidate}
            />
          )}
        {DEBUG &&
          this.props.latestDetection && (
            <Debug>
              <DebugCamera>
                <img src={this.props.latestDetection.image} />
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
              <DebugFaceBuffer>
                {this.props.faceBuffer.map((image: string, i) => (
                  <DebugBufferFrame key={i} src={image} />
                ))}
              </DebugFaceBuffer>
            </Debug>
          )}
      </Container>
    );
  }
}
