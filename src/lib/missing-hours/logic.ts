import { loop, Cmd } from "redux-loop";
import { getMissingHours } from "../api";

export enum TypeKeys {
  MISSING_HOURS_REQUESTED = "missing-hours/MISSING_HOURS_REQUESTED",
  MISSING_HOURS_LOADED = "missing-hours/MISSING_HOURS_LOADED",
  RESET = "missing-hours/RESET"
}

export type Action =
  | IMissingHoursLoadedAction
  | IResetMissingHoursAction
  | IMissingHoursRequestedAction;

interface IMissingHoursRequestedAction {
  type: TypeKeys.MISSING_HOURS_REQUESTED;
  payload: { userId: string };
}

export function requestMissingHours(
  userId: string
): IMissingHoursRequestedAction {
  return {
    type: TypeKeys.MISSING_HOURS_REQUESTED,
    payload: { userId }
  };
}

interface IResetMissingHoursAction {
  type: TypeKeys.RESET;
}

export function resetMissingHours(): IResetMissingHoursAction {
  return {
    type: TypeKeys.RESET
  };
}

interface IMissingHoursLoadedAction {
  type: TypeKeys.MISSING_HOURS_LOADED;
  payload: { hours: number };
}

function missingHoursLoaded(hours: number): IMissingHoursLoadedAction {
  return {
    type: TypeKeys.MISSING_HOURS_LOADED,
    payload: { hours }
  };
}

export interface IState {
  missingHours: number | null;
}

const initialState: IState = {
  missingHours: null
};

export function reducer(state: IState = initialState, action: Action) {
  switch (action.type) {
    case TypeKeys.MISSING_HOURS_REQUESTED: {
      return loop(
        { ...state, missingHours: null },
        Cmd.run(getMissingHours, {
          args: [action.payload.userId],
          successActionCreator: missingHoursLoaded
        })
      );
    }
    case TypeKeys.MISSING_HOURS_LOADED: {
      return { ...state, missingHours: action.payload.hours };
    }
    case TypeKeys.RESET: {
      return state;
    }
  }
  return state;
}
