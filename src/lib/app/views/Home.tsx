import * as React from "react";
import styled, { keyframes } from "styled-components";
import { connect } from "react-redux";

import { Camera } from "../../../components/Camera";
import {
  IState as IRecognitionState,
  FACE_BUFFER_SIZE,
  facesDetected
} from "../../recognition/logic";
import { IDetection, withTracking } from "../../../utils/withTracking";
import { View } from "../../../components/View";
import { IApplicationState } from "../../../store";

export interface IProps {
  imagesBuffered: number;
  trackingStoppedForDebugging: IRecognitionState["trackingStoppedForDebugging"];
}

export interface IDispatchProps {
  facesDetected: (event: IDetection) => void;
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

class Component extends React.Component<IProps & IDispatchProps> {
  public render() {
    return (
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
          trackingStoppedForDebugging={this.props.trackingStoppedForDebugging}
        />
      </View>
    );
  }
}

function mapStateToProps(state: IApplicationState) {
  return {
    trackingStoppedForDebugging: state.recognition.trackingStoppedForDebugging,
    imagesBuffered: state.recognition.faceBuffer.length / FACE_BUFFER_SIZE
  };
}

export const Home = connect<IProps, IDispatchProps>(mapStateToProps, {
  facesDetected
})(Component);
