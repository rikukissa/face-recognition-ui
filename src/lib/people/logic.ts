import { loop, Cmd } from "redux-loop";
import { getPeople, IPerson } from "../api";

export enum TypeKeys {
  PEOPLE_REQUESTED = "people/PEOPLE_REQUESTED",
  PEOPLE_LOADED = "people/PEOPLE_LOADED"
}

type Action = IPeopleLoadedAction | IPeopleRequestedAction;

interface IPeopleRequestedAction {
  type: TypeKeys.PEOPLE_REQUESTED;
}

export function requestPeople(): IPeopleRequestedAction {
  return {
    type: TypeKeys.PEOPLE_REQUESTED
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

export interface IState {
  people: IPerson[];
}

const initialState: IState = {
  people: []
};

export function reducer(state: IState = initialState, action: Action) {
  switch (action.type) {
    case TypeKeys.PEOPLE_REQUESTED: {
      return loop(
        { ...state, people: [] },
        Cmd.run(getPeople, {
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
