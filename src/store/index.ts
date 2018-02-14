import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";

// Features
import {
  reducer as recognition,
  middleware as recognitionMiddleware,
  IState as IRecognitionState
} from "../lib/recognition/logic";
import { reducer as app, IState as IAppState } from "../lib/app/logic";

export interface IApplicationState {
  app: IAppState;
  recognition: IRecognitionState;
}

export const store = createStore(
  combineReducers({
    app,
    recognition
  }),
  applyMiddleware(thunk, recognitionMiddleware)
);
