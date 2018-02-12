import * as React from "react";
import styled from "styled-components";
import { Camera, IDetection } from "./Camera";
import axios from "axios";

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

async function recognize(image: Blob): Promise<string[]> {
  const data = new FormData();

  data.append("file", image);

  const res = await axios.post(
    "https://naama-app-face-recognizer.herokuapp.com/recognize",
    data
  );
  return res.data.FaceMatches.map((match: any) => match.Face.ExternalImageId);
}

async function submitFace(id: string, image: Blob) {
  const data = new FormData();

  data.append("id", id);
  data.append("file", image);

  return axios.post(
    "https://naama-app-face-recognizer.herokuapp.com/faces",
    data
  );
}

class App extends React.Component<
  {},
  {
    currentlyRecognized: null | string;
    latestDetectionImageWithFaces: null | Blob;
    name: string;
  }
> {
  public state = {
    latestDetectionImageWithFaces: null,
    currentlyRecognized: null,
    name: ""
  };
  private numberOfFaces = 0;

  /*
   * Clear user specific UI elements after 10 seconds
   */

  private clearTimeout: null | number = null;

  private clear = () => {
    this.setState({ currentlyRecognized: null });
  };

  private createClearTimer = () => {
    if (this.clearTimeout) {
      window.clearTimeout(this.clearTimeout);
    }
    this.clearTimeout = window.setTimeout(this.clear, 10000);
  };

  private stopClearTimer = () => {
    if (this.clearTimeout) {
      window.clearTimeout(this.clearTimeout);
    }
  };

  /*
   * Face addition stuff
   */

  private storeName = (event: any) => {
    this.setState({ name: event.target.value });
  };

  private submitFace = () => {
    const { latestDetectionImageWithFaces } = this.state;
    if (latestDetectionImageWithFaces) {
      submitFace(this.state.name, latestDetectionImageWithFaces);
    }
  };

  private facesDetected = async (detection: IDetection) => {
    // Stored here to be submitted later when "Submit face" is clicked
    if (detection.amount > 0) {
      this.setState({ latestDetectionImageWithFaces: detection.image });
    }

    // Stop if amount of faces stays the same
    if (detection.amount === this.numberOfFaces) {
      return;
    }

    this.numberOfFaces = detection.amount;

    const names =
      detection.amount === 0 ? [] : await recognize(detection.image);

    if (names.length === 0) {
      this.createClearTimer();
    }

    const { currentlyRecognized } = this.state;

    // Recognized face still in the picture
    if (currentlyRecognized && names.indexOf(currentlyRecognized) > -1) {
      this.stopClearTimer();
      return;
    }

    // New face recognized
    if (names.length > 0) {
      this.setState({
        currentlyRecognized: names[0]
      });
      this.stopClearTimer();
      return;
    }
  };
  public render() {
    return (
      <Container>
        <Camera onFacesDetected={this.facesDetected} />
        {this.state.currentlyRecognized && (
          <Overlay>
            <h1>{this.state.currentlyRecognized}</h1>
          </Overlay>
        )}
        <input type="text" onChange={this.storeName} value={this.state.name} />
        <button onClick={this.submitFace}>Submit face</button>
      </Container>
    );
  }
}

export default App;
