import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { usePersonControls } from "./hooks.js";
import { useFrame } from "@react-three/fiber";
import { Tank } from "./tank.jsx";
import {Vector3} from "three";

const MOVE_SPEED = 5;
const direction = new THREE.Vector3();
const coords={
  x: Math.random()*100-50,
  z: Math.random()*100-50
}
export const Player = ({socket}) => {
  const playerRef = useRef();
  const { forward, backward, left, right } = usePersonControls();
  const [sides,setSide] = useState(0);
  const [theta, setTheta] = useState(-Math.PI);
  const [scopeOffsetX,setScopeOffsetX] = useState(0);
  const [scopeOffsetY,setScopeOffsetY] = useState(0);
  const [isShoot,setIsShooted] = useState(0);
  let counterAnim=0;
  const radius = 3;
  const tankRef = useRef();
  let quaternion = new THREE.Quaternion();

  useFrame((state) => {
    if (!playerRef.current) return;

    ////Вот это обернуть в useEffect не знаю какие зависимости но надо, либо присваивать изначально coords
    ///P.S. вроде работает но почему то не отрисовывает, свойства то в кавычках то нет + починить камеру при включении второго вида 
    //send coords
    socket.emit('stateNow',{
      x: playerRef.current.x,
      y: playerRef.current.y,
      z: playerRef.current.z,
      rotation: tankRef.current.rotation.y,
      socketID: socket.id 
    })

    //meh position
    if (sides == 1) {
      state.camera.setFocalLength(10);
      const velocity = playerRef.current.linvel();

      //model rotation
      if (left) {
        tankRef.current.rotation.y += 0.003;
        const deltaX =  tankRef.current.rotation.y;
        setTheta(deltaX);
      }
      if (right) {
        tankRef.current.rotation.y -= 0.003;
        const deltaX =  tankRef.current.rotation.y;
        setTheta(deltaX);
      }

      //movement direction
      quaternion.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        tankRef.current.rotation.y
      );
      if (forward) {
        direction.set(0, 0, 1).applyQuaternion(quaternion).normalize().multiplyScalar(MOVE_SPEED);
      } else if (backward) {
        direction.set(0, 0, -1).applyQuaternion(quaternion).normalize().multiplyScalar(MOVE_SPEED);
      } else {
        direction.set(0, 0, 0);
      }
      playerRef.current.wakeUp();
      playerRef.current.setLinvel({
        x: direction.x,
        y: velocity.y,
        z: direction.z,
      });
    
      //camera position and direction
      const { x, y, z } = playerRef.current.translation();
      let posX = x + radius * Math.sin(theta);
      let posZ = z + radius * Math.cos(theta);
      state.camera.position.set(posX, y + 3, posZ);
      posX = x + radius * Math.sin(theta)*2;
      posZ = z + radius * Math.cos(theta)*2;
      state.camera.lookAt(new Vector3(posX,y + 3, posZ));
    }

    //position for look around
    if (sides == 0) {
      state.camera.setFocalLength(15);
      const { x, y, z } = playerRef.current.translation();
      state.camera.position.set(x, y + 7, z);
    }

    //scope position
    if (sides == 2){
      state.camera.setFocalLength(70);//90
      
      //camera position
      let R = 11;
      const { x, y, z } = playerRef.current.translation();
      let posX = x + R * Math.sin(theta);
      let posZ = z + R * Math.cos(theta);
      let posY = y + 4;
      state.camera.position.set(posX, posY, posZ);

      //camera direction
      if(scopeOffsetX>Math.PI/24){
        setScopeOffsetX(Math.PI/24);
      }
      if(scopeOffsetX<-Math.PI/24){
        setScopeOffsetX(-Math.PI/24)
      }
      if(scopeOffsetY>Math.PI/12){
        setScopeOffsetY(Math.PI/12);
      }
      if(scopeOffsetY<-Math.PI/12){
        setScopeOffsetY(-Math.PI/12)
      }

      posX = x + R * Math.sin(theta)*2;
      posZ = z + R * Math.cos(theta)*2;
      posY = y+3;
      /////////////////////

      ////Нужно доделать вот это и будет заебись/////////////////
      posY=  (y+3) * R * Math.sin(scopeOffsetY);
      //R=R*Math.cos((scopeOffsetY+theta));
      R=50;
      posX= x + R * Math.sin((theta+scopeOffsetX))*2;
      posZ= z + R * Math.cos((theta+scopeOffsetX))*2;
      ///////////////////////////
      state.camera.lookAt(new THREE.Vector3(posX,posY,posZ));        
    }

    //animate camera when shooting
    if (isShoot){
      let coords = state.camera.position;
      state.camera.position.set(coords.x+Math.random()/5,coords.y+Math.random()/5,coords.z+Math.random()/5);
      counterAnim++;
      if(counterAnim>30){
        setIsShooted(false);
      }
      state.camera.position.set(coords.x,coords.y,coords.z);
    }
  });

  //handler for keydown
  const switchSide=(event)=>{

     //change position of the player in the tank
    switch (event.keyCode){
      case 49: 
        setSide(0);
        break;
      case 50:
        setSide(1);
        break;
      case 51:
        setSide(2);
        break;
    }

    //diretion of camera movement while scoping
    switch (event.keyCode){
      case 37: 
        setScopeOffsetX((oldOffset)=>oldOffset+0.002);
        break;
      case 38:
        setScopeOffsetY((oldOffset)=>oldOffset+0.002);
        break;
      case 39:
        setScopeOffsetX((oldOffset)=>oldOffset-0.002);
        break;
      case 40:
        setScopeOffsetY((oldOffset)=>oldOffset-0.002);
        break;
    }
  };
  
  //add mask for canvas if the side of the player is "shooter"
  useEffect(()=>{
    if (sides == 2){
      setScopeOffsetX(0);
      setScopeOffsetY(0);
      document.getElementById('scope').classList.add('scope');
      document.querySelector('.canvas').classList.add('mask');
    }else{
      document.getElementById('scope').classList.remove('scope');
      document.querySelector('.canvas').classList.remove('mask');
    }
  }, [sides])
  //change camera direction
  
//initialize component
  useEffect(() => {
    document.addEventListener("keydown", switchSide);
    tankRef.current.rotation.y = Math.random()*6;
    playerRef.current.x= coords.x;
    playerRef.current.y= coords.y;
    playerRef.current.z= coords.z;
    direction.set(1, 0, 0);
    return () => {
      document.addEventListener("keydown", switchSide);
    };
  }, []);

  return (
    <>
      <RigidBody position={[coords.x, 1, coords.z]} ref={playerRef} lockRotations>
        <group ref={tankRef}>
          <Tank position={[0, 0, 0]} statement={sides} setisShoot={setIsShooted}/>
        </group>
      </RigidBody>
    </>
  );
};
