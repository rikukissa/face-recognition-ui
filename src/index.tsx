import * as React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import "./index.css";

import { store } from "./store";

import App from "./lib/app/container";

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root") as HTMLElement
);
