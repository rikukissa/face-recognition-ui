import * as React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { IDetection, withTracking } from "../../../utils/withTracking";
import {
  IState as IRecognitionState,
  facesDetected
} from "../../recognition/logic";

import { Camera } from "../../../components/Camera";
import { View } from "../../../components/View";
import { Speech } from "../../../components/Speech";
import { IApplicationState } from "../../../store";
import { navigateToHome } from "../logic";
import { DASHBOARD_TIMEOUT } from "../../../utils/config";
import { IPerson } from "../../api";
import { requestPerson } from "../../people/logic";

const PersonName = styled.div`
  font-size: 50px;
`;

const Avatar = styled.div.attrs<{ src: string }>({})`
  width: 100px;
  height: 100px;
  background: url(${({ src }) => src});
  background-size: cover;
  border-radius: 50px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.5em;
`;

const Text = styled.span``;

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  background: linear-gradient(45deg, rgb(84, 55, 93) 0%, rgba(0, 0, 0, 0) 100%);
`;

const Row = styled.div`
  display: flex;
  :not(:last-child) {
    box-shadow: inset 0px -1px 1px -1px rgba(255, 255, 255, 0.4);
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  flex-grow: 1;
  font-size: 30px;
  padding: 1em;
  text-align: center;
  font-weight: 200;
  color: #fff;
`;

const ItemValue = styled.div`
  strong {
    font-size: 60px;
    display: block;
    font-weight: 400;
  }
`;

const PersonItem = styled(Item)`
  align-items: flex-start;
`;
const HoursItem = styled(Item)`
  background: #31c4c7;
  color: #2d3a62;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0);
  flex-grow: 0;
`;

const CalendarItem = styled(Item)`
  flex-direction: row;
  ${ItemValue} {
    flex-grow: 0;
  }
`;

const ItemContent = styled.div`
  flex-grow: 1;
  text-align: left;
  padding-left: 2em;
  font-size: 24px;
`;

const EventName = styled.div`
  font-weight: 400;
`;
const EventLocation = styled.div``;

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
        <Speech text={speechText} />
        <Grid>
          <Row>
            <PersonItem>
              <PersonName>
                <Avatar src="https://avatars3.githubusercontent.com/u/1206987?s=460&v=4" />
                <Text>{this.props.person.first}</Text>
              </PersonName>
            </PersonItem>

            <HoursItem>
              <ItemValue>
                <strong>{this.props.person.missingHours}</strong>
                missing hours
              </ItemValue>
            </HoursItem>
          </Row>
          <Row>
            <CalendarItem>
              <ItemValue>
                <strong>10</strong> minutes<br />
              </ItemValue>
              <ItemContent>
                <EventName>Tech 15 minutes</EventName>
                <EventLocation>
                  Futurice Ltd. 4th floor, 26-28 Underwood St, Hoxton, London N1
                  7JQ, UK
                </EventLocation>
              </ItemContent>
            </CalendarItem>
          </Row>
          <Row>
            <CalendarItem>
              <ItemValue>
                <strong>4.15</strong>pm<br />
              </ItemValue>
              <ItemContent>
                <EventName>Recruitment catch-up</EventName>
                <EventLocation>Boardroom</EventLocation>
              </ItemContent>
            </CalendarItem>
          </Row>
        </Grid>

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
