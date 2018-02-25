import { createModelForFace, recognize } from "../api";
// TODO feels a bit nasty to refer to the event type from here
import { IDetection, IFaceRect } from "../../utils/withTracking";
import { loop, Cmd } from "redux-loop";
import { crop } from "../../utils/image";
import { getBestImageFromBuffer } from "./utils";

const FACE_BUFFER_SIZE = 9;

export type Action =
  | IFacesRecognisedAction
  | IFaceRecognitionFailedAction
  | IFaceReappearedAction
  | IFaceDetectedAction
  | IFacesDetectedAction
  | IFaceSavedAction
  | IToggleTrackingAction
  | IImageToBeBufferedAction
  | IResetAction
  | ISubmitFaceAction;

export enum TypeKeys {
  RESET = "recognition/RESET",
  FACE_DETECTED = "recognition/FACE_DETECTED",
  FACES_DETECTED = "recognition/FACES_DETECTED",
  FACE_RECOGNISED = "recognition/FACE_RECOGNISED",
  FACES_AMOUNT_CHANGED = "recognition/FACES_AMOUNT_CHANGED",
  FACE_SAVED = "recognition/FACE_SAVED",
  FACE_RECOGNITION_FAILED = "recognition/FACE_RECOGNITION_FAILED",
  FACE_REAPPEARED = "recognition/FACE_REAPPEARED",
  SUBMIT_FACE = "recognition/SUBMIT_FACE",
  DEBUG_TOGGLE_TRACKING = "recognition/DEBUG_TOGGLE_TRACKING",
  IMAGE_RECEIVED_FOR_BUFFERING = "recognition/IMAGE_RECEIVED_FOR_BUFFERING"
}

interface IFaceDetectedAction {
  type: TypeKeys.FACE_DETECTED;
  payload: { image: string };
}

interface IFacesDetectedAction {
  type: TypeKeys.FACES_DETECTED;
  payload: { detection: IDetection };
}

export function facesDetected(detection: IDetection): IFacesDetectedAction {
  return {
    type: TypeKeys.FACES_DETECTED,
    payload: { detection }
  };
}

interface IFacesRecognisedAction {
  type: TypeKeys.FACE_RECOGNISED;
  payload: { names: string[] };
}

function facesRecognised(names: string[]): Action {
  return {
    type: TypeKeys.FACE_RECOGNISED,
    payload: { names }
  };
}

interface IFaceRecognitionFailedAction {
  type: TypeKeys.FACE_RECOGNITION_FAILED;
  payload: { error: Error };
}

function faceRecognitionFailed(error: Error): Action {
  console.log(error);

  return {
    type: TypeKeys.FACE_RECOGNITION_FAILED,
    payload: { error }
  };
}

interface IFaceSavedAction {
  type: TypeKeys.FACE_SAVED;
}

function faceSaved(): IFaceSavedAction {
  return {
    type: TypeKeys.FACE_SAVED
  };
}
interface IFaceReappearedAction {
  type: TypeKeys.FACE_REAPPEARED;
}

function faceReappeared(): IFaceReappearedAction {
  return {
    type: TypeKeys.FACE_REAPPEARED
  };
}
interface IImageToBeBufferedAction {
  type: TypeKeys.IMAGE_RECEIVED_FOR_BUFFERING;
  payload: { detection: IBufferedDetection };
}

export interface IBufferedDetection {
  image: string;
  rect: IFaceRect;
}
function bufferImage(detection: IBufferedDetection): IImageToBeBufferedAction {
  return {
    type: TypeKeys.IMAGE_RECEIVED_FOR_BUFFERING,
    payload: { detection }
  };
}

/*
* Exported actions
*/
interface IToggleTrackingAction {
  type: TypeKeys.DEBUG_TOGGLE_TRACKING;
}

export function toggleTracking(): IToggleTrackingAction {
  return {
    type: TypeKeys.DEBUG_TOGGLE_TRACKING
  };
}

interface ISubmitFaceAction {
  type: TypeKeys.SUBMIT_FACE;
  payload: { name: string };
}
export const submitFace = (name: string) => {
  return {
    type: TypeKeys.SUBMIT_FACE,
    payload: { name }
  };
};
interface IResetAction {
  type: TypeKeys.RESET;
}

export const reset = () => {
  return {
    type: TypeKeys.RESET
  };
};

function simpleDist(pointA: IFaceRect, pointB: IFaceRect) {
  const x = pointA.x - pointB.x;
  const y = pointA.y - pointB.y;

  return Math.sqrt(x * x + y * y);
}

function originalFaceStillInPicture(
  firstFaceDetected: null | IFaceRect,
  latestDetection: null | IDetection,
  detection: IDetection
) {
  if (!firstFaceDetected || !latestDetection || detection.amount === 0) {
    return false;
  }

  const sortedFaces = detection.data
    .slice(0)
    .sort(
      (a, b) =>
        simpleDist(a, firstFaceDetected) - simpleDist(b, firstFaceDetected)
    );
  const closest = sortedFaces[0];

  const likelyTheSame =
    Math.abs(firstFaceDetected.x - closest.x) < firstFaceDetected.width &&
    Math.abs(firstFaceDetected.y - closest.y) < firstFaceDetected.height;

  return likelyTheSame ? closest : false;
}

/*
 * State
 */
export interface IState {
  latestDetection: null | IDetection;
  currentlyRecognized: string[];
  currentNumberOfFaces: null | number;
  faceBuffer: IBufferedDetection[];
  recognitionInProgress: boolean;
  trackingStoppedForDebugging: boolean;
  firstFaceDetected: null | IFaceRect;
}

const initialState = {
  latestDetection: null,
  currentlyRecognized: [],
  currentNumberOfFaces: null,
  faceBuffer: [],
  recognitionInProgress: false,
  trackingStoppedForDebugging: false,
  firstFaceDetected: null
};

export function reducer(state: IState = initialState, action: Action) {
  const { latestDetection, faceBuffer } = state;
  switch (action.type) {
    case TypeKeys.RESET: {
      return initialState;
    }
    case TypeKeys.IMAGE_RECEIVED_FOR_BUFFERING: {
      const { detection } = action.payload;

      const newBuffer = faceBuffer.concat(detection).slice(-FACE_BUFFER_SIZE);
      const newState = { ...state, faceBuffer: newBuffer };

      const shouldRecognize =
        // Only recognize once per buffer. If the buffer isn't cleared,
        // there's no need to rerecognize since it's most likely the same person
        newBuffer.length > state.faceBuffer.length &&
        newBuffer.length === FACE_BUFFER_SIZE;

      if (shouldRecognize) {
        const frame = getBestImageFromBuffer(newBuffer);

        return loop(
          {
            ...newState,
            recognitionInProgress: true
          },

          Cmd.run(() => crop(frame.image, frame.rect).then(recognize), {
            successActionCreator: facesRecognised,
            failActionCreator: faceRecognitionFailed
          })
        );
      }
      return newState;
    }
    case TypeKeys.FACES_DETECTED: {
      if (state.recognitionInProgress) {
        return state;
      }
      const { detection } = action.payload;

      const firstFaceInPicture = originalFaceStillInPicture(
        state.firstFaceDetected,
        latestDetection,
        detection
      );
      const amountChanged =
        !latestDetection || latestDetection.amount !== detection.amount;

      const newFaceAppeared =
        (!latestDetection || latestDetection.amount === 0) &&
        detection.amount === 1;

      const newFirstFaceInPicture = firstFaceInPicture
        ? firstFaceInPicture
        : detection.data[0];

      const shouldKeepBuffer =
        (((!amountChanged && detection.amount === 1) || firstFaceInPicture) &&
          firstFaceInPicture) ||
        newFaceAppeared;

      const newState = {
        ...state,
        latestDetection: detection,
        firstFaceDetected: newFirstFaceInPicture,
        faceBuffer: !shouldKeepBuffer ? [] : state.faceBuffer
      };
      if (newFirstFaceInPicture) {
        return loop(
          newState,
          Cmd.action(
            bufferImage({
              image: detection.image,
              rect: newFirstFaceInPicture
            })
          )
        );
      }
      return newState;
    }

    case TypeKeys.FACE_RECOGNISED: {
      const existingFaces = action.payload.names.filter(
        name => state.currentlyRecognized.indexOf(name) > -1
      );

      const newState = {
        ...state,
        currentlyRecognized: state.currentlyRecognized.concat(
          action.payload.names
        ),
        recognitionInProgress: false
      };

      if (existingFaces.length > 0) {
        return loop(newState, Cmd.action(faceReappeared()));
      }
      return newState;
    }

    case TypeKeys.FACE_RECOGNITION_FAILED:
      return { ...state, faceBuffer: [], recognitionInProgress: false };

    case TypeKeys.SUBMIT_FACE:
      return loop(
        state,
        Cmd.run(createModelForFace, {
          args: [action.payload.name, state.faceBuffer],
          successActionCreator: faceSaved
        })
      );

    case TypeKeys.FACE_SAVED:
      return {
        ...state,
        faceBuffer: []
      };

    case TypeKeys.DEBUG_TOGGLE_TRACKING:
      return {
        ...state,
        trackingStoppedForDebugging: !state.trackingStoppedForDebugging
      };

    default:
      return state;
  }
}
