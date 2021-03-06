import { loop, Cmd } from "redux-loop";
import {
  TypeKeys as RecognitionActionTypes,
  Action as RecognitionAction,
  reset as resetRecognition
} from "../recognition/logic";

import { reset as resetPeople, Action as PeopleAction } from "../people/logic";

import {
  push,
  RouterAction,
  LOCATION_CHANGE,
  LocationChangeAction
} from "react-router-redux";
import { IPerson } from "../api";

export enum TypeKeys {
  NAVIGATE_TO_HOME = "app/NAVIGATE_TO_HOME"
}

type Action = INavigateToHomeAction;

interface INavigateToHomeAction {
  type: TypeKeys.NAVIGATE_TO_HOME;
}

export function navigateToHome(): INavigateToHomeAction {
  return {
    type: TypeKeys.NAVIGATE_TO_HOME
  };
}

export interface IState {
  isAwake: boolean;
  currentLocation: null | Location;
}

const initialState: IState = {
  isAwake: false,
  currentLocation: null
};

function isInHomeView(state: IState) {
  return state.currentLocation && state.currentLocation.pathname === "/";
}
function isInDashboardView(state: IState, user: IPerson) {
  return (
    state.currentLocation &&
    state.currentLocation.pathname.includes(`dashboard/${user.username}`)
  );
}

function pushWithSearch(pathname: string) {
  return push({
    pathname,
    search: window.location.search
  });
}

export function reducer(
  state: IState = initialState,
  action: Action | RecognitionAction | LocationChangeAction
) {
  switch (action.type) {
    case LOCATION_CHANGE:
      return loop({ ...state, currentLocation: action.payload }, Cmd.none);

    case RecognitionActionTypes.FACES_DETECTED:
      if (action.payload.detection.amount > 0) {
        return { ...state, isAwake: true };
      }
      return state;
    case RecognitionActionTypes.FACE_RECOGNISED:
      const recognisedSomeone = action.payload.people.length > 0;
      if (!recognisedSomeone && isInHomeView(state)) {
        return loop(state, Cmd.action(pushWithSearch("/who-is-this")));
      }

      if (!recognisedSomeone) {
        return state;
      }

      const recognisedUser = action.payload.people[0];

      if (isInDashboardView(state, recognisedUser)) {
        return state;
      }

      return loop(
        state,
        Cmd.action(pushWithSearch(`/dashboard/${recognisedUser.username}`))
      );

    case RecognitionActionTypes.FACE_SAVED:
      return loop(
        state,
        Cmd.list<RecognitionAction | RouterAction>([
          Cmd.action(resetRecognition()),
          Cmd.action(pushWithSearch(`/`))
        ])
      );
    case TypeKeys.NAVIGATE_TO_HOME:
      return loop(
        { ...state, isAwake: "false" },
        Cmd.list<RecognitionAction | RouterAction | PeopleAction>([
          Cmd.action(resetRecognition()),
          Cmd.action(resetPeople()),
          Cmd.action(pushWithSearch(`/`))
        ])
      );
  }
  return state;
}
