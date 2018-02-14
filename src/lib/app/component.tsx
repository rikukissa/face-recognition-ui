import * as React from "react";
import styled from "styled-components";
import { Camera, IDetection } from "../../components/Camera";

const Container = styled.div`
  position: relative;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #abffab;
`;

const Input = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  padding: 1em;
  background: #fff;
`;

export interface IProps {
  currentlyRecognized: null | string;
  latestDetectionImageWithFaces: null | Blob;
}

export interface IDispatchProps {
  recognizeFaces: (event: IDetection) => void;
  submitFace: (name: string) => void;
}

export class App extends React.Component<
  IProps & IDispatchProps,
  { name: string }
> {
  public state = {
    name: ""
  };
  /*
   * Clear user specific UI elements after 10 seconds
   */

  // private clearTimeout: null | number = null;

  // private clear = () => {
  //   this.setState({ currentlyRecognized: null });
  // };

  // private createClearTimer = () => {
  //   if (this.clearTimeout) {
  //     window.clearTimeout(this.clearTimeout);
  //   }
  //   this.clearTimeout = window.setTimeout(this.clear, 10000);
  // };

  // private stopClearTimer = () => {
  //   if (this.clearTimeout) {
  //     window.clearTimeout(this.clearTimeout);
  //   }
  // };

  /*
   * Face addition stuff
   */

  private storeName = (event: any) => {
    this.setState({ name: event.target.value });
  };

  private submitFace = () => {
    this.props.submitFace(this.state.name);
  };

  public render() {
    return (
      <Container>
        <Camera onFacesDetected={this.props.recognizeFaces} />
        {this.props.currentlyRecognized && (
          <Overlay>
            <h1>{this.props.currentlyRecognized}</h1>
          </Overlay>
        )}
        <Input>
          <input
            type="text"
            onChange={this.storeName}
            value={this.state.name}
          />
          <button onClick={this.submitFace}>Submit face</button>
        </Input>
      </Container>
    );
  }
}
