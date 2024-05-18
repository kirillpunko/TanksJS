import { PointerLockControls, Sky } from "@react-three/drei";
import { Ground } from "./Ground.jsx";
import { Physics, RigidBody } from "@react-three/rapier";
import { Player } from "./player.jsx";
import { OtherPlayer } from "./otherPlayer.jsx";

import socketIO from 'socket.io-client'
import { useEffect,useState } from "react";

const socket= socketIO.connect('http://localhost:5000');

const shadowOffset= 50;
export const App = () => {
  let aliveMore = -1;
  const [playersData,setPlayersData]=useState(null);

  useEffect(()=>{
    socket.on('responseState',(data)=>{
      setPlayersData(data);
    })
  },[playersData,socket])

  if (aliveMore==0){
    console.log('u win')
  }

  return (
    <>
      <PointerLockControls mousespeed={0.1}/>
      <Sky sunPosition={[100, 20, 100]}></Sky>
      <ambientLight intensity={1.5} />
      <directionalLight 
        castShadow 
        intensity={1.5} 
        position={[100,100,0]}
        shadow-mapSize = {4096}
        shadow-camera-top={shadowOffset}
        shadow-camera-bottom={-shadowOffset}
        shadow-camera-left={shadowOffset}
        shadow-camera-right={-shadowOffset}
      />
      <Physics gravity={[0, -20, 0]}>
        <Ground />
        <Player socket={socket}/>
        {
          playersData && playersData.map((data)=>{
              if (data.socketID!=socket.id){/*
                if (!data.isDie){
                  aliveMore++;
                }*/
                return(
                <OtherPlayer key={data.socketID} id={data.socketID} x={data.x} y={data.y} z={data.z} rotation={data.rotation} shoot={false}/>
                )
              }
              else{/*
                aliveMore++;*/
                return null;
              }
            })
        }
        <RigidBody>
          <mesh position={[0, 0, 0]}>
            <boxGeometry />
          </mesh>
        </RigidBody>
      </Physics>
    </>
  );
};
export default App;
