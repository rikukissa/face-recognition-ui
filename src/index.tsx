import { render } from "react-dom";
import { createApp } from "./app";

const { app } = createApp();

render(app, document.getElementById("root") as HTMLElement);
