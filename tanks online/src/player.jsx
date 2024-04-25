import * as THREE from "three";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { usePersonControls } from "./hooks.js";
import { useFrame } from "@react-three/fiber";
import { Tank } from "./tank.jsx";
import {Vector3} from "three";

const MOVE_SPEED = 5;
const direction = new THREE.Vector3();

export const Player = () => {
  const playerRef = useRef();
  const { forward, backward, left, right } = usePersonControls();
  const [sides,setSide] = useState(0);
  const [theta, setTheta] = useState(-Math.PI);
  const [gamma, setGamma] = useState(-Math.PI);
  const [dirScope, setDirScope] = useState('');
  const [scopeOffsetX,setScopeOffsetX] = useState(0);
  const [scopeOffsetY,setScopeOffsetY] = useState(0);
  const [isShoot,setIsShooted] = useState(0);
  const [upDown,setUpDown] = useState(false);
  const [leftRight,setLeftRight] = useState(false);
  const [lastLook,setLastLook] = useState(new THREE.Vector3(0,0,1));
  let counterAnim=0;
  const radius = 3;
  const tankRef = useRef();
  let quaternion = new THREE.Quaternion();

  useFrame((state) => {
    if (!playerRef.current) return;

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
      setLastLook(new Vector3(posX,y+3, posZ));
    }

    //position for look around
    if (sides == 0) {
      state.camera.setFocalLength(15);
      const { x, y, z } = playerRef.current.translation();
      state.camera.position.set(x, y + 7, z);
    }

    //scope position
    if (sides == 2){
      state.camera.setFocalLength(10);//90
      
      //camera position
      let R = 11;
      const { x, y, z } = playerRef.current.translation();
      let posX = x + R * Math.sin(theta);
      let posZ = z + R * Math.cos(theta);
      let posY = y + 4;
      state.camera.position.set(posX, posY, posZ);

      //camera direction
      posX = x + R * Math.sin(theta)*2;
      posZ = z + R * Math.cos(theta)*2;
      posY = y+3;
      ////////////////////
      ////Нужно доделать вот это и будет заебись//////////////
      console.log(scopeOffsetX,scopeOffsetY)
      posY=y+R*Math.sin(scopeOffsetY)*2;
      R=R*Math.cos(scopeOffsetY);
      posX= x+R*Math.cos(scopeOffsetX)*2;
      posZ=z+R*Math.sin(scopeOffsetX)*2;
      ///////////////////////////
      state.camera.lookAt(new THREE.Vector3(posX,posY,posZ));
      /*state.camera.rotation.y=tankRef.current.rotation.y+Math.PI;
      state.camera.rotation.x=tankRef.current.rotation.x
      state.camera.rotation.z=0;*/
      
      if(scopeOffsetX>Math.PI/12){
        setScopeOffsetX(Math.PI/12);
      }
      if(scopeOffsetX<-Math.PI/12){
        setScopeOffsetX(-Math.PI/12)
      }
      if(scopeOffsetY>Math.PI/20){
        setScopeOffsetY(Math.PI/20);
      }
      if(scopeOffsetY<-Math.PI/20){
        setScopeOffsetY(-Math.PI/20)
      }
      if (upDown){

      }
      if (leftRight){

      }

      setUpDown(false);
      setLeftRight(false);
      
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
        setScopeOffsetX((oldOffset)=>oldOffset-0.01);;
        setLeftRight(true);
        break;
      case 38:
        setScopeOffsetY((oldOffset)=>oldOffset+0.01)
        setUpDown(true);
        break;
      case 39:
        setScopeOffsetX((oldOffset)=>oldOffset+0.01);
        setLeftRight(true);
        break;
      case 40:
        setScopeOffsetY((oldOffset)=>oldOffset-0.01);
        setUpDown(true);
        break;
    }
  };
  
  //add mask for canvas if the side of the player is "shooter"
  useEffect(()=>{
    if (sides == 2){
      setScopeOffsetX(0);
      setScopeOffsetY(0);
      //document.getElementById('scope').classList.add('scope');
      //document.querySelector('.canvas').classList.add('mask');
    }else{
      document.getElementById('scope').classList.remove('scope');
      document.querySelector('.canvas').classList.remove('mask');
    }
  }, [sides])
  //change camera direction
  
//initialize component
  useEffect(() => {
    document.addEventListener("keydown", switchSide);
    tankRef.current.rotation.y = Math.PI;
    direction.set(1, 0, 0);
    return () => {
      document.addEventListener("keydown", switchSide);
    };
  }, []);

  return (
    <>
      <RigidBody position={[-5, 1, 15]} ref={playerRef} lockRotations>
        <group ref={tankRef}>
          <Tank position={[0, 0, 0]} statement={sides} setisShoot={setIsShooted}/>
        </group>
      </RigidBody>
    </>
  );
};
