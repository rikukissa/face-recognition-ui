import * as React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { IDetection, withTracking } from "../../../utils/withTracking";
import {
  IState as IRecognitionState,
  facesDetected
} from "../../recognition/logic";

import { Camera } from "../../../components/Camera";
import { View, FullscreenText, Title } from "../../../components/View";
import { Speech } from "../../../components/Speech";
import { IApplicationState } from "../../../store";
import { navigateToHome } from "../logic";
import { DASHBOARD_TIMEOUT } from "../../../utils/config";
import { IPerson } from "../../api";
import { requestPerson } from "../../people/logic";

const PersonName = styled.h1`
  position: absolute;
  background: #000;
  color: #fff;
  margin: 1em;
`;

const TrackingCamera = withTracking(Camera);

interface IProps {
  username: string;
  person: IPerson | null;
  lastRecognitionAt: null | number;
  trackingStoppedForDebugging: IRecognitionState["trackingStoppedForDebugging"];
}

interface IDispatchProps {
  onFacesDetected: (event: IDetection) => void;
  requestPerson: (userId: string) => void;
  navigateToHome: () => void;
}

class Component extends React.Component<IProps & IDispatchProps> {
  private timeout: number | null = null;
  public componentDidMount() {
    this.props.requestPerson(this.props.username);
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
    // TODO loader
    if (!this.props.person) {
      return <div />;
    }

    const speechText = this.props.person.first || "";
    return (
      <View>
        <PersonName>{this.props.person.first}</PersonName>
        <Speech text={speechText} />

        <FullscreenText>
          <Title>
            You have <strong>{this.props.person.missingHours}</strong> missing
            hours
          </Title>
        </FullscreenText>

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
    username: ownProps.match.params.user,
    person: state.people.person,
    lastRecognitionAt: state.recognition.lastRecognitionAt,
    trackingStoppedForDebugging: state.recognition.trackingStoppedForDebugging
  };
}

export const Dashboard = connect<IProps, IDispatchProps>(mapStateToProps, {
  onFacesDetected: facesDetected,
  requestPerson,
  navigateToHome
})(Component);
