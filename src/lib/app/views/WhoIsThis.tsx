import * as React from "react";
import styled from "styled-components";
import * as annyang from "annyang";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #abffab;
`;

interface IProps {
  image: Blob;
  onSave: (name: string) => void;
}

export class WhoIsThis extends React.Component<
  IProps,
  { name: string; image: null | string }
> {
  public state = {
    name: "",
    image: null
  };

  public componentDidMount() {
    const commands = {
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
    annyang.addCommands(commands);

    // Start listening.
    annyang.start();

    const reader = new FileReader();
    reader.readAsDataURL(this.props.image);
    reader.onloadend = () => {
      const base64Data = reader.result;
      this.setState({ image: base64Data });
    };
  }
  // TODO clear commands on umount

  public render() {
    const { image } = this.state;
    return (
      <Overlay>
        <h1>Who is this?</h1>
        <p>
          I'm ...<br />
          My name is ...
        </p>
        {this.state.name !== "" && (
          <div>
            <h2>Hey {this.state.name}</h2>
            <h2>say "save" when you're done</h2>
          </div>
        )}
        {image && <img src={image} />}
      </Overlay>
    );
  }
}
