import React from "react";
import App from "./App.jsx";
import "./index.css";
import { Canvas } from "@react-three/fiber";

export const MainWindow = () => {

  return (
    <div id="container" >
      <div id="scope"> </div>
      <Canvas className="canvas" camera={{ fov: 60 }} shadows>
        <App />
      </Canvas>
    </div>
  );
};

export default MainWindow;