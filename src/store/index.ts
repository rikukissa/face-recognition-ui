import { createStore, applyMiddleware, compose } from "redux";
import { combineReducers, install, StoreCreator } from "redux-loop";

const enhancedCreateStore = createStore as StoreCreator;

// Features
import {
  reducer as recognition,
  IState as IRecognitionState
} from "../lib/recognition/logic";

import {
  reducer as missingHours,
  IState as IMissingHoursState
} from "../lib/missing-hours/logic";

import { reducer as people, IState as IPeopleState } from "../lib/people/logic";

import {
  reducer as app,
  IState as IAppState,
  timerMiddleware
} from "../lib/app/logic";

export interface IApplicationState {
  app: IAppState;
  recognition: IRecognitionState;
  missingHours: IMissingHoursState;
  people: IPeopleState;
}

const enhancer = compose(install(), applyMiddleware(timerMiddleware));

export const storeCreator = () =>
  enhancedCreateStore(
    combineReducers({
      app,
      recognition,
      people,
      missingHours
    }),
    undefined,
    enhancer
  );

export { storeCreator as createStore };
