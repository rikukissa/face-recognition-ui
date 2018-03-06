import { createStore, applyMiddleware, compose, Store } from "redux";
import { combineReducers, install, StoreCreator } from "redux-loop";
import {
  routerReducer,
  RouterState,
  routerMiddleware
} from "react-router-redux";
import { createBrowserHistory } from "history";

const enhancedCreateStore = createStore as StoreCreator;

// Features
import {
  reducer as recognition,
  IState as IRecognitionState
} from "../lib/recognition/logic";

import { reducer as people, IState as IPeopleState } from "../lib/people/logic";

import { reducer as app, IState as IAppState } from "../lib/app/logic";

export interface IApplicationState {
  app: IAppState;
  recognition: IRecognitionState;
  people: IPeopleState;
  routing: RouterState;
}

const composeEnhancers =
  typeof window === "object" &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose;

export const storeCreator = () => {
  const history = createBrowserHistory();
  const middleware = routerMiddleware(history);
  const enhancer = composeEnhancers(install(), applyMiddleware(middleware));
  const store = enhancedCreateStore(
    combineReducers({
      app,
      recognition,
      people,
      routing: routerReducer
    }),
    undefined,
    enhancer
  ) as Store<IApplicationState>;

  return { store, history };
};

export { storeCreator as createStore };
