import * as React from "react";
import styled, { keyframes } from "styled-components";
import * as shallowCompare from "react-addons-shallow-compare";
import { Camera } from "../../components/Camera";
import { Debugger } from "./Debugger";
import { IState } from "./logic";
import {
  IState as IRecognitionState,
  IBufferedDetection
} from "../recognition/logic";
import { IState as IMissingHoursState } from "../missing-hours/logic";

import { IDetection, withTracking } from "../../utils/withTracking";
import { Dashboard } from "./views/Dashboard";
import { DEBUG } from "../../utils/config";
import { WhoIsThis } from "./views/WhoIsThis";
import { View } from "../../components/View";
const Container = styled.div`
  position: relative;
  height: 100%;
  background: radial-gradient(ellipse at center, #080a20 0%, #0d0e19 100%);
`;

export interface IProps {
  imagesBuffered: number;
  currentlyRecognized: null | string;
  currentView: IState["currentView"];
  trackingStoppedForDebugging: IRecognitionState["trackingStoppedForDebugging"];
  latestRecognitionCandidate: null | IBufferedDetection;
  missingHours: IMissingHoursState["missingHours"];
}

export interface IDispatchProps {
  facesDetected: (event: IDetection) => void;
  submitFace: (name: string) => void;
  toggleTracking: () => void;
}

const TrackingCamera = withTracking(Camera);

const pulsate = keyframes`
  0% {
    transform: scale(.1) translate(-50%, -50%);
    opacity: 0.0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1.2) translate(-50%, -50%);
    opacity: 0;
  }
  `;

const Pulse = styled.div.attrs<{ percentageLoaded: number }>({})`
  position: absolute;
  top: 50%;
  left: 50%;
  animation: ${pulsate} 2s ease-out;
  animation-iteration-count: infinite;
  transform: translate(-50%, -50%);
  transform-origin: top left;
  polygon {
    fill: ${({ percentageLoaded }) =>
      `rgba(112, 87, 255, ${percentageLoaded})`};
  }
`;

export class App extends React.Component<IProps & IDispatchProps> {
  private submitFace = (name: string) => {
    this.props.submitFace(name);
  };
  public shouldComponentUpdate(nextProps: IProps, nextState: any): boolean {
    return shallowCompare(this, nextProps, nextState);
  }
  public render() {
    return (
      <Container>
        {this.props.currentView === "home" && (
          <View>
            <Pulse percentageLoaded={this.props.imagesBuffered}>
              <svg
                width={339 / 3 + "px"}
                height={391 / 3 + "px"}
                viewBox="0 0 339 391"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <polygon
                    stroke="#7057FF"
                    strokeWidth="5"
                    points="169.5 3 336.20989 99.25 336.20989 291.75 169.5 388 2.79010977 291.75 2.79010977 99.25"
                  />
                </g>
              </svg>
            </Pulse>
            <TrackingCamera
              onFacesDetected={this.props.facesDetected}
              trackingStoppedForDebugging={
                this.props.trackingStoppedForDebugging
              }
            />
          </View>
        )}
        {this.props.currentView === "dashboard" && (
          <Dashboard
            currentlyRecognized={this.props.currentlyRecognized}
            missingHours={this.props.missingHours}
            onFacesDetected={this.props.facesDetected}
            trackingStoppedForDebugging={this.props.trackingStoppedForDebugging}
          />
        )}
        {this.props.currentView === "who is this" &&
          this.props.latestRecognitionCandidate && (
            <WhoIsThis onSave={this.submitFace} />
          )}
        {DEBUG && <Debugger />}
      </Container>
    );
  }
}
