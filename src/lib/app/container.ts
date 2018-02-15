import { connect } from "react-redux";
import { App, IProps, IDispatchProps } from "./component";
import { IApplicationState } from "../../store";
import { recognizeFaces, submitFace } from "../recognition/logic";

function mapStateToProps(state: IApplicationState) {
  return {
    currentView: state.app.currentView,
    currentlyRecognized: state.recognition.currentlyRecognized[0],
    latestDetectionImageWithFaces:
      state.recognition.latestDetectionImageWithFaces
  };
}

export default connect<IProps, IDispatchProps>(mapStateToProps, {
  recognizeFaces,
  submitFace
})(App);
