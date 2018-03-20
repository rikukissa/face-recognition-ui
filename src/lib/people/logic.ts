import { loop, Cmd } from "redux-loop";
import { getPeople, IPerson, getPerson } from "../api";
import {
  TypeKeys as RecognitionActionTypes,
  Action as RecognitionAction
} from "../recognition/logic";
export enum TypeKeys {
  PEOPLE_SEARCH_REQUESTED = "people/PEOPLE_SEARCH_REQUESTED",
  PEOPLE_SEARCH_LOADED = "people/PEOPLE_SEARCH_LOADED",
  PERSON_REQUESTED = "people/PERSON_REQUESTED",
  PERSON_LOADED = "people/PERSON_LOADED",
  RESET = "people/RESET"
}

export type Action =
  | IPeopleLoadedAction
  | IPeopleSearchedAction
  | IPersonLoadedAction
  | IPersonRequestedAction
  | IResetPeopleAction;

interface IPersonRequestedAction {
  type: TypeKeys.PERSON_REQUESTED;
  payload: { username: string };
}

export function requestPerson(username: string): IPersonRequestedAction {
  return {
    type: TypeKeys.PERSON_REQUESTED,
    payload: { username }
  };
}

interface IPersonLoadedAction {
  type: TypeKeys.PERSON_LOADED;
  payload: { person: IPerson };
}

function personLoaded(person: IPerson): IPersonLoadedAction {
  return {
    type: TypeKeys.PERSON_LOADED,
    payload: { person }
  };
}

interface IPeopleSearchedAction {
  type: TypeKeys.PEOPLE_SEARCH_REQUESTED;
  payload: { name: string };
}

export function searchPeople(name: string): IPeopleSearchedAction {
  return {
    type: TypeKeys.PEOPLE_SEARCH_REQUESTED,
    payload: { name }
  };
}

interface IPeopleLoadedAction {
  type: TypeKeys.PEOPLE_SEARCH_LOADED;
  payload: { people: IPerson[] };
}

function peopleLoaded(people: IPerson[]): IPeopleLoadedAction {
  return {
    type: TypeKeys.PEOPLE_SEARCH_LOADED,
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
  person: null | IPerson;
}

const initialState: IState = {
  people: [],
  person: null
};

export function reducer(
  state: IState = initialState,
  action: Action | RecognitionAction
) {
  switch (action.type) {
    case TypeKeys.RESET: {
      return initialState;
    }
    case RecognitionActionTypes.FACE_RECOGNISED:
      const recognisedSomeone = action.payload.people.length > 0;

      if (!recognisedSomeone) {
        return state;
      }

      return { ...state, person: action.payload.people[0] };

    case TypeKeys.PEOPLE_SEARCH_REQUESTED: {
      return loop(
        { ...state, people: [] },
        Cmd.run(getPeople, {
          args: [action.payload.name],
          successActionCreator: peopleLoaded
        })
      );
    }
    case TypeKeys.PERSON_REQUESTED: {
      return loop(
        { ...state, people: [] },
        Cmd.run(getPerson, {
          args: [action.payload.username],
          successActionCreator: personLoaded
        })
      );
    }
    case TypeKeys.PERSON_LOADED: {
      return { ...state, person: action.payload.person };
    }
    case TypeKeys.PEOPLE_SEARCH_LOADED: {
      return { ...state, people: action.payload.people };
    }
  }
  return state;
}
