export interface IState {
  something: number;
}
interface INOOPAction {
  type: "NOOP";
}
type Action = INOOPAction;

const initialState = {
  something: 1
};
export function reducer(state: IState = initialState, action: Action) {
  return state;
}
