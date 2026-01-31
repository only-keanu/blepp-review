import './index.css';
import React from "react";
import { render } from "react-dom";
import { App } from "./App";
import { initTheme } from "./lib/theme";

initTheme();
render(<App />, document.getElementById("root"));
