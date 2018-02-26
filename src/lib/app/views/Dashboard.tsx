import * as React from "react";
import styled from "styled-components";
import { IDetection, withTracking } from "../../../utils/withTracking";
import { IState as IRecognitionState } from "../../recognition/logic";
import { IState as IMissingHoursState } from "../../missing-hours/logic";
import { Camera } from "../../../components/Camera";

const PersonName = styled.h1`
  position: absolute;
  background: #000;
  color: #fff;
  margin: 1em;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const MissingHoursContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const MissingHours = styled.span`
  background: #000;
  color: #fff;
  font-size: 100px;
`;

const TrackingCamera = withTracking(Camera);

interface IProps {
  currentlyRecognized: null | string;
  missingHours: IMissingHoursState["missingHours"];
  trackingStoppedForDebugging: IRecognitionState["trackingStoppedForDebugging"];
}

interface IDispatchProps {
  onFacesDetected: (event: IDetection) => void;
}

export class Dashboard extends React.Component<IProps & IDispatchProps> {
  public render() {
    return (
      <Overlay>
        <PersonName>{this.props.currentlyRecognized}</PersonName>

        {this.props.missingHours !== null && (
          <MissingHoursContainer>
            <MissingHours>
              You have <strong>{this.props.missingHours}</strong> missing hours
            </MissingHours>
          </MissingHoursContainer>
        )}

        <TrackingCamera
          onFacesDetected={this.props.onFacesDetected}
          trackingStoppedForDebugging={this.props.trackingStoppedForDebugging}
        />
      </Overlay>
    );
  }
}
