import { configure, mount } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import { Store } from "react-redux";
import { IApplicationState } from "./store";
import { createApp } from "./app";
import { facesDetected } from "./lib/recognition/logic";
import { recognize } from "./lib/api";
import { IFaceRect } from "./utils/withTracking";
import { DASHBOARD_TIMEOUT } from "./utils/config";

/*
 * Test runner config
 */

jest.useFakeTimers();

configure({ adapter: new Adapter() });

jest.mock("./components/Camera", () => "div");
jest.mock("./utils/image", () => ({
  crop: (image: string, rect: IFaceRect) => Promise.resolve(image)
}));
jest.mock("./utils/withTracking", () => ({
  withTracking: () => () => "div"
}));
jest.mock("./lib/speech/speak", () => ({
  sayShit: () => Promise.resolve()
}));
jest.mock("./utils/withDisplay", () => ({
  withDisplay: () => () => "div"
}));
jest.mock("./utils/camera", () => () => "div");
jest.mock("./lib/api", () => ({
  recognize: jest.fn(),
  getMissingHours: jest.fn(),
  createModelForFace: () => Promise.resolve(),
  getPeople: () => Promise.resolve([])
}));
jest.mock("annyang", () => ({
  addCommands: () => null,
  removeCommands: () => null,
  start: () => null
}));

const TEST_IMAGE = {
  width: 100,
  height: 100,
  data: new Uint8ClampedArray([]),
  BYTES_PER_ELEMENT: 8
};

function getPathname(store: Store<IApplicationState>) {
  const location = store.getState().routing.location;
  return location ? location.pathname : "";
}

describe("App", () => {
  let store: Store<IApplicationState>;

  beforeEach(async () => {
    const testApp = createApp();
    store = testApp.store;

    // Bind this to a variable if you wanna test if DOM looks right
    mount(testApp.app);

    (recognize as jest.Mock<Promise<string[]>>).mockReturnValue(
      Promise.resolve(["riku"])
    );
  });
  describe("when face is recognized", () => {
    beforeEach(async () => {
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
      expect(getPathname(store)).toMatch(/dashboard\/riku/);
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
        await jest.runAllTimers();
        expect(getPathname(store)).toMatch(/\/$/);
      });
      describe("when face reappers", () => {
        it("doesn't go back if the same face is recognized again", async () => {
          await jest.runTimersToTime(DASHBOARD_TIMEOUT - 1000);
          for (let i = 0; i < 10; i++) {
            await store.dispatch(
              facesDetected({
                image: TEST_IMAGE,
                amount: 1,
                data: [{ width: 100, height: 100, x: 0, y: 0 }]
              })
            );
          }
          await jest.runTimersToTime(2000);
          expect(getPathname(store)).toMatch(/dashboard/);
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

          expect(getPathname(store)).toMatch(/dashboard\/foobar/);
        });
      });
    });
  });
  describe("when multiple faces get recognized", () => {
    it("still tries to keep track of the first recognized face", async () => {
      const a = { width: 100, height: 100, x: 50, y: 50 };
      const b = { width: 100, height: 100, x: 0, y: 0 };
      const c = { width: 40, height: 40, x: 60, y: 60 };

      await store.dispatch(
        facesDetected({
          image: TEST_IMAGE,
          amount: 1,
          data: [a]
        })
      );

      await store.dispatch(
        facesDetected({
          image: TEST_IMAGE,
          amount: 2,
          data: [a, b]
        })
      );

      for (let i = 0; i < 4; i++) {
        await store.dispatch(
          facesDetected({
            image: TEST_IMAGE,
            amount: 2,
            data: [{ ...a, x: a.x - i }, { ...b, x: b.x - i }]
          })
        );
      }
      for (let i = 0; i < 4; i++) {
        await store.dispatch(
          facesDetected({
            image: TEST_IMAGE,
            amount: 3,
            data: [{ ...a, x: a.x - i }, { ...b, x: b.x - i }, c]
          })
        );
      }
      expect(store.getState().recognition.currentlyRecognized).toEqual([
        "riku"
      ]);
    });
  });
});
