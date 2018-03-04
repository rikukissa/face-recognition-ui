import * as React from "react";
import { Provider } from "react-redux";
import { Route } from "react-router";
import { ConnectedRouter } from "react-router-redux";
import "./index.css";

import { createStore } from "./store";

import App from "./lib/app/container";
import { WhoIsThis } from "./lib/app/views/WhoIsThis";
import { Dashboard } from "./lib/app/views/Dashboard";
import { Home } from "./lib/app/views/Home";

export function createApp() {
  const { store, history } = createStore();
  const app = (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App>
          <Route exact path="/" component={Home} />
          <Route path="/dashboard/:user" component={Dashboard} />
          <Route path="/who-is-this" component={WhoIsThis} />
        </App>
      </ConnectedRouter>
    </Provider>
  );
  return { app, store };
}
