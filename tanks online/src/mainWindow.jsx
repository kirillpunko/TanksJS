import React from "react";
import App from "./App.jsx";
import "./index.css";
import { Canvas } from "@react-three/fiber";

export const MainWindow = () => {

  return (
    <div id="container" >
      <div id="scope"> </div>
      <div id="win" className="ResWindow"> </div>
      <div id="lose" className="ResWindow">
        <div className="resContainer">
          <div className="dieText">
            YOU DIED
          </div>    
          <button className="backBtn" onClick={()=>{console.log("click")}}>Back to main</button>
        </div>
      </div>
      <Canvas className="canvas" camera={{ fov: 60 }} shadows>
        <App />
      </Canvas>
    </div>
  );
};

export default MainWindow;