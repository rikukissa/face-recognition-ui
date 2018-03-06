import { connect } from "react-redux";
import { App } from "./component";
import { IApplicationState } from "../../store";

function mapStateToProps(
  state: IApplicationState,
  ownProps: { children: Element[] }
) {
  return ownProps;
}

export default connect<{}>(mapStateToProps, null, null, { pure: false })(App);
