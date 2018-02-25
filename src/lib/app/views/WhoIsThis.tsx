import * as React from "react";
import styled from "styled-components";
import * as annyang from "annyang";
import { withDisplay } from "../../../utils/withDisplay";
import { Camera } from "../../../components/Camera";

const CameraDisplay = styled(withDisplay(Camera))`
  width: 100%;
`;
const Text = styled.div`
  padding: 1em;
  position: absolute;
  top: 0;
  left: 0;
`;
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  color: #fff;
`;
const Title = styled.h1`
  background: #000;
  color: #fff;
`;

const Description = styled.span`
  background: #000;
  color: #fff;
`;

interface IProps {
  image: string;
  onSave: (name: string) => void;
}

export class WhoIsThis extends React.Component<IProps, { name: string }> {
  private commands: { [key: string]: (param: string) => void } = {};
  public state = {
    name: ""
  };

  public componentDidMount() {
    this.commands = {
      "my name is :name": (name: string) => {
        this.setState({ name });
      },
      "I'm :name": (name: string) => {
        this.setState({ name });
      },
      save: () => {
        this.props.onSave(this.state.name);
      },
      // Debug route
      hello: () => {
        alert("hello");
      }
    };

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
      <Overlay>
        <Text>
          {this.state.name === "" && (
            <div>
              <Title>Who is this?</Title>
              <Description>
                I'm ...<br />
                My name is ...
              </Description>
            </div>
          )}
          {this.state.name !== "" && (
            <Title>Hey {this.state.name}! say "save" when you're done</Title>
          )}
        </Text>

        <CameraDisplay />
      </Overlay>
    );
  }
}
