import { connect } from "react-redux";
import { App, IProps, IDispatchProps } from "./component";
import { IApplicationState } from "../../store";
import {
  facesDetected,
  submitFace,
  toggleTracking,
  FACE_BUFFER_SIZE
} from "../recognition/logic";
import { requestPeople } from "../people/logic";

function mapStateToProps(state: IApplicationState) {
  return {
    people: state.people.people,
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
  toggleTracking,
  requestPeople
})(App);
