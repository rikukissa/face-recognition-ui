import * as React from "react";
import styled from "styled-components";
import * as annyang from "annyang";

import { sayShit } from "../../speech/speak";

import {
  View,
  FullscreenText,
  Title,
  Subtitle
} from "../../../components/View";
import { IState as IPeopleState } from "../../people/logic";


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
  onSave: (name: string) => void;
}

export class WhoIsThis extends React.Component<IProps, { name: string }> {
  private commands: { [key: string]: (param: string) => void } = {};
  public state = {
    name: ""
  };
  private setName = (name: string) => {
    this.setState({ name });
  };
  private save = (id: string) => {
    this.props.onSave(id);
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

    // test text-to-speech
    if (this.state.name.length === 0) {
      sayShit("Who is this?");
    }

    // Add our commands to annyang
    annyang.addCommands(this.commands);

    // Start listening.
    annyang.start();
  }

  public componentWillUnmount() {
    annyang.removeCommands(Object.keys(this.commands));
  }

  public render() {
    return (
      <View>
        {this.state.name === "" && (
          <CenteredFullscreenText>
            <Title>Who is this?</Title>
            <br />
            <br />
            <Subtitle>🎤 Say "My name is YOUR FIRST NAME"</Subtitle>
          </CenteredFullscreenText>
        )}
        {this.state.name !== "" && (
          <ListContainer>
            <List>
              {this.props.people.map(person => (
                <PersonButton
                  onClick={() => this.save(person.id)}
                  key={person.id}
                >
                  {person.firstname}
                </PersonButton>
              ))}
            </List>
          </ListContainer>
        )}
      </View>
    );
  }
}
