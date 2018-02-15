import * as React from "react";
import styled from "styled-components";
import { Camera, IDetection } from "../../components/Camera";
import { IState } from "./logic";

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
  currentView: IState["currentView"];
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
        {this.props.currentView === "dashboard" && (
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
