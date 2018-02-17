import * as React from "react";
import { configure, mount, ReactWrapper } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import { Store, Provider } from "react-redux";
import { createStore, IApplicationState } from "../../store";
import App from "./container";
import { facesDetected } from "../recognition/logic";
import { recognize } from "../api";

/*
 * Test runner config
 */

jest.useFakeTimers();

configure({ adapter: new Adapter() });

jest.mock("../../components/Camera", () => "div");
jest.mock("../../utils/withTracking", () => ({ withTracking: () => "div" }));
jest.mock("../../utils/camera", () => () => "div");
jest.mock("../api", () => ({
  recognize: jest.fn().mockReturnValue(Promise.resolve(["riku"])),
  createModelForFace: () => Promise.resolve()
}));
jest.mock("annyang", () => ({
  addCommands: () => null,
  removeCommands: () => null,
  start: () => null
}));

const TEST_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==";

const createView = (store: Store<any>, element: JSX.Element) =>
  mount(<Provider store={store}>{element}</Provider>);

function createTestApp(element: JSX.Element) {
  const store = createStore();
  const view = createView(store, element);
  return { view, store: store as Store<IApplicationState> };
}

describe("App", () => {
  let store: Store<IApplicationState>;
  let view: ReactWrapper<any, any>;
  describe("when face is recognized", () => {
    beforeEach(async () => {
      const testApp = createTestApp(<App />);
      store = testApp.store;
      view = testApp.view;
      for (let i = 0; i < 10; i++) {
        await store.dispatch(
          facesDetected({
            image: TEST_IMAGE,
            amount: 1,
            data: [{ width: 100, height: 100, x: 0, y: 0 }]
          })
        );
      }
      expect(store.getState().recognition.currentlyRecognized).toEqual([
        "riku"
      ]);
    });
    it("shows the personal dashboard", async () => {
      expect(store.getState().app.currentView).toEqual("dashboard");
    });
    describe("when no faces are recognised again", () => {
      beforeEach(async () => {
        await store.dispatch(
          facesDetected({
            image: TEST_IMAGE,
            amount: 0,
            data: []
          })
        );
      });
      it("goes back to home view after a while", async () => {
        jest.runOnlyPendingTimers();
        expect(store.getState().app.currentView).toEqual("home");
      });
      describe("when face reappers", () => {
        it("doesn't go back if the same face is recognized again", async () => {
          for (let i = 0; i < 10; i++) {
            await store.dispatch(
              facesDetected({
                image: TEST_IMAGE,
                amount: 1,
                data: [{ width: 100, height: 100, x: 0, y: 0 }]
              })
            );
          }

          jest.runOnlyPendingTimers();
          expect(store.getState().app.currentView).toEqual("dashboard");
        });
        it("goes to new person's dashboard if it's not the same face", async () => {
          (recognize as jest.Mock<Promise<string[]>>).mockReturnValue(
            Promise.resolve(["foobar"])
          );

          for (let i = 0; i < 10; i++) {
            await store.dispatch(
              facesDetected({
                image: TEST_IMAGE,
                amount: 1,
                data: [{ width: 100, height: 100, x: 0, y: 0 }]
              })
            );
          }
          jest.runOnlyPendingTimers();
          expect(store.getState().app.currentView).toEqual("dashboard");
          expect(view.text().indexOf("foobar")).toBeGreaterThan(-1);
        });
      });
    });
  });
});
