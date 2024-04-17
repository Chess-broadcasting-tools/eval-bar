import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LandingPage, App, Ccm } from "./app";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/evalbars" element={<App />} />
        <Route path="/ccm" element={<Ccm />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
