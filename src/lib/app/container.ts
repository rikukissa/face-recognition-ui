import { connect } from "react-redux";
import { App, IProps, IDispatchProps } from "./component";
import { IApplicationState } from "../../store";
import {
  facesDetected,
  submitFace,
  toggleTracking,
  FACE_BUFFER_SIZE
} from "../recognition/logic";
import { getBestImageFromBuffer } from "../recognition/utils";

function mapStateToProps(state: IApplicationState) {
  return {
    latestRecognitionCandidate:
      state.app.currentView === "who is this"
        ? getBestImageFromBuffer(state.recognition.faceBuffer)
        : null,
    currentView: state.app.currentView,
    currentlyRecognized: state.recognition.currentlyRecognized[0],
    trackingStoppedForDebugging: state.recognition.trackingStoppedForDebugging,
    missingHours: state.missingHours.missingHours,
    imagesBuffered: state.recognition.faceBuffer.length / FACE_BUFFER_SIZE
  };
}

export default connect<IProps, IDispatchProps>(mapStateToProps, {
  facesDetected,
  submitFace,
  toggleTracking
})(App);
