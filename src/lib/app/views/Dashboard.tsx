import * as React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { IDetection, withTracking } from "../../../utils/withTracking";
import {
  IState as IRecognitionState,
  facesDetected
} from "../../recognition/logic";
import {
  IState as IMissingHoursState,
  requestMissingHours
} from "../../missing-hours/logic";
import { Camera } from "../../../components/Camera";
import { View, FullscreenText, Title } from "../../../components/View";
import { Speech } from "../../../components/Speech";
import { IApplicationState } from "../../../store";
import { navigateToHome } from "../logic";
import { DASHBOARD_TIMEOUT } from "../../../utils/config";

const PersonName = styled.h1`
  position: absolute;
  background: #000;
  color: #fff;
  margin: 1em;
`;

const TrackingCamera = withTracking(Camera);

interface IProps {
  user: string;
  lastRecognitionAt: null | number;
  currentlyRecognized: null | string;
  missingHours: IMissingHoursState["missingHours"];
  trackingStoppedForDebugging: IRecognitionState["trackingStoppedForDebugging"];
}

interface IDispatchProps {
  onFacesDetected: (event: IDetection) => void;
  requestMissingHours: (userId: string) => void;
  navigateToHome: () => void;
}

class Component extends React.Component<IProps & IDispatchProps> {
  private timeout: number | null = null;
  public componentDidMount() {
    this.props.requestMissingHours(this.props.user);
    this.resetTimeout();
  }

  public componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.lastRecognitionAt !== this.props.lastRecognitionAt) {
      this.resetTimeout();
    }
  }
  public componentWillUnmount() {
    if (this.timeout !== null) {
      window.clearTimeout(this.timeout);
    }
  }
  private resetTimeout = () => {
    if (this.timeout !== null) {
      window.clearTimeout(this.timeout);
    }

    this.timeout = window.setTimeout(
      this.props.navigateToHome,
      DASHBOARD_TIMEOUT
    );
  };
  public render() {
    const speechText = this.props.user || "";
    return (
      <View>
        <PersonName>{this.props.user}</PersonName>
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

function mapStateToProps(state: IApplicationState, ownProps: any) {
  return {
    user: ownProps.match.params.user,
    currentlyRecognized: state.recognition.currentlyRecognized[0],
    lastRecognitionAt: state.recognition.lastRecognitionAt,
    trackingStoppedForDebugging: state.recognition.trackingStoppedForDebugging,
    missingHours: state.missingHours.missingHours
  };
}

export const Dashboard = connect<IProps, IDispatchProps>(mapStateToProps, {
  onFacesDetected: facesDetected,
  requestMissingHours,
  navigateToHome
})(Component);
