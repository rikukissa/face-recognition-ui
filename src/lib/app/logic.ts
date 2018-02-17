import { Middleware, MiddlewareAPI, Dispatch } from "redux";
import {
  TypeKeys as RecognitionActionTypes,
  Action as RecognitionAction
} from "../recognition/logic";
import { IApplicationState } from "../../store";

export interface IState {
  currentView: "home" | "dashboard" | "who is this";
}

export enum TypeKeys {
  NAVIGATE_TO_HOME = "app/NAVIGATE_TO_HOME"
}

type Action = INavigateToHomeAction;

const initialState: IState = {
  currentView: "home"
};

export function reducer(
  state: IState = initialState,
  action: Action | RecognitionAction
): IState {
  switch (action.type) {
    case RecognitionActionTypes.FACE_RECOGNISED:
      if (action.payload.names.length === 0 && state.currentView === "home") {
        return { ...state, currentView: "who is this" };
      }
      return { ...state, currentView: "dashboard" };
    case RecognitionActionTypes.FACE_SAVED:
      return { ...state, currentView: "home" };

    case TypeKeys.NAVIGATE_TO_HOME:
      if (state.currentView === "who is this") {
        return state;
      }
      return { ...state, currentView: "home" };
  }
  return state;
}

interface INavigateToHomeAction {
  type: TypeKeys.NAVIGATE_TO_HOME;
}

function navigateToHome(): INavigateToHomeAction {
  return {
    type: TypeKeys.NAVIGATE_TO_HOME
  };
}
export interface IAppMiddleware<K> extends Middleware {
  <S extends K>(api: MiddlewareAPI<S>): (next: Dispatch<S>) => Dispatch<S>;
}
export const middleware: IAppMiddleware<IApplicationState> = <
  S extends IApplicationState
>(
  api: MiddlewareAPI<S>
) => (next: Dispatch<S>) => {
  let timeout: number;

  return (action: any) => {
    const currentView = api.getState().app.currentView;

    if (RecognitionActionTypes.FACE_REAPPEARED && timeout) {
      window.clearTimeout(timeout);
    }

    if (
      action.type === RecognitionActionTypes.FACES_AMOUNT_CHANGED &&
      action.payload.amount === 0 &&
      currentView === "dashboard"
    ) {
      if (timeout) {
        window.clearTimeout(timeout);
      }
      timeout = window.setTimeout(() => api.dispatch(navigateToHome()), 5000);
    }
    return next(action);
  };
};
