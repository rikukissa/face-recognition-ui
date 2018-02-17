import { createStore, applyMiddleware, compose } from "redux";
import { combineReducers, install, StoreCreator } from "redux-loop";

const enhancedCreateStore = createStore as StoreCreator;

// Features
import {
  reducer as recognition,
  IState as IRecognitionState
} from "../lib/recognition/logic";

import {
  reducer as app,
  IState as IAppState,
  middleware as appMiddleware
} from "../lib/app/logic";

export interface IApplicationState {
  app: IAppState;
  recognition: IRecognitionState;
}

const enhancer = compose(install(), applyMiddleware(appMiddleware));

export const storeCreator = () =>
  enhancedCreateStore(
    combineReducers({
      app,
      recognition
    }),
    undefined,
    enhancer
  );

export { storeCreator as createStore };
