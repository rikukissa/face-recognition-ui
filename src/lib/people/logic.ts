import { loop, Cmd } from "redux-loop";
import { getPeople, IPerson } from "../api";

export enum TypeKeys {
  PEOPLE_REQUESTED = "people/PEOPLE_REQUESTED",
  PEOPLE_LOADED = "people/PEOPLE_LOADED",
  RESET = "people/RESET"
}

export type Action =
  | IPeopleLoadedAction
  | IPeopleRequestedAction
  | IResetPeopleAction;

interface IPeopleRequestedAction {
  type: TypeKeys.PEOPLE_REQUESTED;
  payload: { name: string };
}

export function requestPeople(name: string): IPeopleRequestedAction {
  return {
    type: TypeKeys.PEOPLE_REQUESTED,
    payload: { name }
  };
}

interface IPeopleLoadedAction {
  type: TypeKeys.PEOPLE_LOADED;
  payload: { people: IPerson[] };
}

function PeopleLoaded(people: IPerson[]): IPeopleLoadedAction {
  return {
    type: TypeKeys.PEOPLE_LOADED,
    payload: { people }
  };
}
interface IResetPeopleAction {
  type: TypeKeys.RESET;
}

export function reset(): IResetPeopleAction {
  return {
    type: TypeKeys.RESET
  };
}

export interface IState {
  people: IPerson[];
}

const initialState: IState = {
  people: []
};

export function reducer(state: IState = initialState, action: Action) {
  switch (action.type) {
    case TypeKeys.RESET: {
      return initialState;
    }
    case TypeKeys.PEOPLE_REQUESTED: {
      return loop(
        { ...state, people: [] },
        Cmd.run(getPeople, {
          args: [action.payload.name],
          successActionCreator: PeopleLoaded
        })
      );
    }
    case TypeKeys.PEOPLE_LOADED: {
      return { ...state, people: action.payload.people };
    }
  }
  return state;
}
