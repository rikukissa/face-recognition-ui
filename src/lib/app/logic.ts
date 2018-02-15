import { Middleware } from "redux";
import {
  TypeKeys as RecognitionActionTypes,
  Action as RecognitionAction
} from "../recognition/logic";
export interface IState {
  currentView: "home" | "dashboard";
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
      return { ...state, currentView: "dashboard" };
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

export const middleware: Middleware = api => next => {
  let timeout: number;

  return (action: any) => {
    if (
      action.type === RecognitionActionTypes.FACES_AMOUNT_CHANGED &&
      action.payload.amount === 0
    ) {
      if (timeout) {
        window.clearTimeout(timeout);
      }
      timeout = window.setTimeout(() => api.dispatch(navigateToHome()), 5000);
    }
    return next(action);
  };
};
