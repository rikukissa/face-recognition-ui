import { Middleware } from "redux";
import { Dispatch } from "react-redux";
import { createModelForFace, recognize } from "../api";
import { IApplicationState } from "../../store";

// TODO
import { IDetection } from "../../components/Camera";

export interface IState {
  currentlyRecognized: null | string;
  latestDetectionImageWithFaces: null | Blob;
  currentNumberOfFaces: null | number;
}

type Action =
  | IFaceDetectedAction
  | IFaceRecognisedAction
  | IFacesAmountChangedAction
  | IClearCurrentRecognitionAction;

export enum TypeKeys {
  FACE_DETECTED = "recognition/FACE_DETECTED",
  FACE_RECOGNISED = "recognition/FACE_RECOGNISED",
  FACES_AMOUNT_CHANGED = "recognition/FACES_AMOUNT_CHANGED",
  CLEAR_CURRENT_RECOGNITION = "recognition/CLEAR_CURRENT_RECOGNITION"
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

interface IFaceRecognisedAction {
  type: TypeKeys.FACE_RECOGNISED;
  payload: { name: string };
}

function faceRecognised(name: string): IFaceRecognisedAction {
  return {
    type: TypeKeys.FACE_RECOGNISED,
    payload: { name }
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
interface IClearCurrentRecognitionAction {
  type: TypeKeys.CLEAR_CURRENT_RECOGNITION;
}

function clearCurrentRecognition(): IClearCurrentRecognitionAction {
  return {
    type: TypeKeys.CLEAR_CURRENT_RECOGNITION
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
    state.currentlyRecognized &&
    names.indexOf(state.currentlyRecognized) > -1
  ) {
    dispatch(faceRecognised(names[0]));
    return;
  }

  // New face recognized
  if (names.length > 0) {
    dispatch(faceRecognised(names[0]));
    return;
  }
};

/*
 * State
 */

const initialState = {
  latestDetectionImageWithFaces: null,
  currentlyRecognized: null,
  currentNumberOfFaces: null
};

export function reducer(state: IState = initialState, action: Action) {
  switch (action.type) {
    case TypeKeys.FACE_DETECTED:
      return { ...state, latestDetectionImageWithFaces: action.payload.image };

    case TypeKeys.FACE_RECOGNISED:
      return { ...state, currentlyRecognized: action.payload.name };

    case TypeKeys.CLEAR_CURRENT_RECOGNITION:
      return { ...state, currentlyRecognized: null };

    case TypeKeys.FACES_AMOUNT_CHANGED:
      return { ...state, currentNumberOfFaces: action.payload.amount };

    default:
      break;
  }

  return state;
}

export const middleware: Middleware = api => next => {
  let timeout: number;

  return (action: any) => {
    if (
      action.type === TypeKeys.FACES_AMOUNT_CHANGED &&
      action.payload.amount === 0
    ) {
      if (timeout) {
        window.clearTimeout(timeout);
      }
      timeout = window.setTimeout(
        () => api.dispatch(clearCurrentRecognition()),
        5000
      );
    }
    return next(action);
  };
};
