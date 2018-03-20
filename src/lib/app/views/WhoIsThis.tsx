import * as React from "react";
import styled from "styled-components";
import * as annyang from "annyang";
import { connect } from "react-redux";

import { Speech } from "../../../components/Speech";

import {
  View,
  FullscreenText,
  Title,
  Subtitle
} from "../../../components/View";
import { IState as IPeopleState, searchPeople } from "../../people/logic";
import { IApplicationState } from "../../../store";
import { submitFace } from "../../recognition/logic";
import { navigateToHome } from "../logic";
import { WHO_IS_THIS_TIMEOUT } from "../../../utils/config";

const CenteredFullscreenText = styled(FullscreenText)`
  text-align: center;
`;

const ListContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const List = styled.div`
  width: 50%;
`;

const PersonButton = styled.button`
  width: 100%;
  padding: 0.25em 0;
  margin-bottom: 0.5em;
  border: 1px solid #7057ff;
  background: transparent;
  font-size: 48px;
  font-family: inherit;
  color: #7057ff;
`;

interface IProps {
  people: IPeopleState["people"];
}
interface IDispatchProps {
  onSave: (name: string) => void;
  navigateToHome: () => void;
  searchPeople: (name: string) => void;
}
export class Component extends React.Component<
  IProps & IDispatchProps,
  { name: string }
> {
  private timeout: number | null = null;
  private commands: { [key: string]: (param: string) => void } = {};
  public state = {
    name: ""
  };
  private setName = (name: string) => {
    this.resetTimeout();
    this.setState({ name });
    this.props.searchPeople(name);
  };

  private save = (id: string) => {
    this.resetTimeout();
    this.props.onSave(id);
  };

  private resetTimeout = () => {
    if (this.timeout !== null) {
      window.clearTimeout(this.timeout);
    }
    this.timeout = window.setTimeout(
      this.props.navigateToHome,
      WHO_IS_THIS_TIMEOUT
    );
  };

  public componentDidMount() {
    this.commands = {
      "my name is :name": this.setName,
      save: this.save,
      // Debug route
      hello: () => {
        alert("hello");
      }
    };

    // Add our commands to annyang
    annyang.addCommands(this.commands);

    // Start listening.
    annyang.start();

    this.resetTimeout();
  }

  public componentWillUnmount() {
    if (this.timeout !== null) {
      window.clearTimeout(this.timeout);
    }
    annyang.removeCommands(Object.keys(this.commands));
  }

  public render() {
    return (
      <View>
        {this.state.name === "" && (
          <CenteredFullscreenText>
            <Speech text="Who is this?" />
            <Title>Who is this?</Title>
            <br />
            <br />
            <Subtitle>🎤 Say "My name is YOUR FIRST NAME"</Subtitle>
          </CenteredFullscreenText>
        )}
        {this.state.name !== "" && (
          <ListContainer>
            <Speech text={"Is it one of these?"} />
            <List>
              {this.props.people.map(person => (
                <PersonButton
                  onClick={() => this.save(person.username)}
                  key={person.username}
                >
                  {person.first} {person.last}
                </PersonButton>
              ))}
            </List>
          </ListContainer>
        )}
      </View>
    );
  }
}

function mapStateToProps(state: IApplicationState) {
  return {
    people: state.people.people
  };
}

export const WhoIsThis = connect<IProps, IDispatchProps>(mapStateToProps, {
  onSave: submitFace,
  navigateToHome,
  searchPeople
})(Component);
