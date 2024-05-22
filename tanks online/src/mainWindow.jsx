import React from "react";
import App from "./App.jsx";
import "./index.css";
import { Canvas } from "@react-three/fiber";

export const MainWindow = () => {

  return (
    <div id="container" >
      <div id="scope"> </div>
      <div id="win" className="ResWindow winWindow">
        <div className="resContainer">
          <div className="resText win">
            YOU WIN
          </div>    
          <button className="backBtn win" onClick={()=>{console.log("click")}}>Back to main</button>
        </div>   
      </div>
      <div id="lose" className="ResWindow">
        <div className="resContainer">
          <div className="resText die">
            YOU DIED
          </div>    
          <button className="backBtn die" onClick={()=>{console.log("click")}}>Back to main</button>
        </div>
      </div>
      <Canvas className="canvas" camera={{ fov: 60 }} shadows>
        <App />
      </Canvas>
    </div>
  );
};

export default MainWindow;