import * as React from "react";
import styled from "styled-components";
import { IDetection, withTracking } from "../../../utils/withTracking";
import { IState as IRecognitionState } from "../../recognition/logic";
import { IState as IMissingHoursState } from "../../missing-hours/logic";
import { Camera } from "../../../components/Camera";
import { View, FullscreenText, Title } from "../../../components/View";
import { Speech } from "../../../components/Speech";

const PersonName = styled.h1`
  position: absolute;
  background: #000;
  color: #fff;
  margin: 1em;
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
    const speechText = this.props.currentlyRecognized || "";
    return (
      <View>
        <PersonName>{this.props.currentlyRecognized}</PersonName>
        <Speech text={speechText} />
        {this.props.missingHours !== null && (
          <FullscreenText>
            <Title>
              You have <strong>{this.props.missingHours}</strong> missing hours
            </Title>
          </FullscreenText>
        )}

        <TrackingCamera
          onFacesDetected={this.props.onFacesDetected}
          trackingStoppedForDebugging={this.props.trackingStoppedForDebugging}
        />
      </View>
    );
  }
}
