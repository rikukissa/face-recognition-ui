import { connect } from "react-redux";
import { App, IDispatchProps } from "./component";
import { IApplicationState } from "../../store";
import { requestPeople } from "../people/logic";

function mapStateToProps(
  state: IApplicationState,
  ownProps: { children: Element[] }
) {
  return ownProps;
}

export default connect<{}, IDispatchProps>(
  mapStateToProps,
  {
    requestPeople
  },
  null,
  { pure: false }
)(App);
