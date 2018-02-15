import { Dispatch } from "react-redux";
import { createModelForFace, recognize } from "../api";
import { IApplicationState } from "../../store";

// TODO feels a bit nasty to refer to the event type from here
import { IDetection } from "../../components/Camera";

export interface IState {
  currentlyRecognized: string[];
  latestDetectionImageWithFaces: null | Blob;
  currentNumberOfFaces: null | number;
}

export type Action =
  | IFaceDetectedAction
  | IFacesRecognisedAction
  | IFacesAmountChangedAction;

export enum TypeKeys {
  FACE_DETECTED = "recognition/FACE_DETECTED",
  FACE_RECOGNISED = "recognition/FACE_RECOGNISED",
  FACES_AMOUNT_CHANGED = "recognition/FACES_AMOUNT_CHANGED"
}

interface IFaceDetectedAction {
  type: TypeKeys.FACE_DETECTED;
  payload: { image: Blob };
}

function faceDetected(image: Blob): IFaceDetectedAction {
  return {
    type: TypeKeys.FACE_DETECTED,
    payload: { image }
  };
}

interface IFacesRecognisedAction {
  type: TypeKeys.FACE_RECOGNISED;
  payload: { names: string[] };
}

function facesRecognised(names: string[]): IFacesRecognisedAction {
  return {
    type: TypeKeys.FACE_RECOGNISED,
    payload: { names }
  };
}

interface IFacesAmountChangedAction {
  type: TypeKeys.FACES_AMOUNT_CHANGED;
  payload: { amount: number };
}

function facesAmountChanged(amount: number): IFacesAmountChangedAction {
  return {
    type: TypeKeys.FACES_AMOUNT_CHANGED,
    payload: { amount }
  };
}

/*
 * Exported actions
 */

export const submitFace = (name: string) => async (
  dispatch: Dispatch<Action>,
  getState: () => IApplicationState
) => {
  const state = getState().recognition;
  if (!state.latestDetectionImageWithFaces) {
    return;
  }
  await createModelForFace(name, state.latestDetectionImageWithFaces);
};

export const recognizeFaces = (detection: IDetection) => async (
  dispatch: Dispatch<Action>,
  getState: () => IApplicationState
) => {
  const state = getState().recognition;

  // Stored here to be submitted later when "Submit face" is clicked
  if (detection.amount > 0) {
    dispatch(faceDetected(detection.image));
  }

  // Stop if amount of faces stays the same
  if (detection.amount === state.currentNumberOfFaces) {
    return;
  }

  dispatch(facesAmountChanged(detection.amount));

  const names = detection.amount === 0 ? [] : await recognize(detection.image);

  // Recognized face still in the picture
  if (
    state.currentlyRecognized.length > 0 &&
    names.indexOf(state.currentlyRecognized[0]) > -1
  ) {
    // Places current face to the beginning of the list
    dispatch(
      facesRecognised([
        state.currentlyRecognized[0],
        ...names.filter(name => name !== state.currentlyRecognized[0])
      ])
    );
    return;
  }

  dispatch(facesRecognised(names));
};

/*
 * State
 */

const initialState = {
  latestDetectionImageWithFaces: null,
  currentlyRecognized: [],
  currentNumberOfFaces: null
};

export function reducer(state: IState = initialState, action: Action) {
  switch (action.type) {
    case TypeKeys.FACE_DETECTED:
      return { ...state, latestDetectionImageWithFaces: action.payload.image };

    case TypeKeys.FACE_RECOGNISED:
      return { ...state, currentlyRecognized: action.payload.names };

    case TypeKeys.FACES_AMOUNT_CHANGED:
      return { ...state, currentNumberOfFaces: action.payload.amount };

    default:
      break;
  }

  return state;
}
