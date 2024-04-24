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
  const radius = 3;
  const tankRef = useRef();
  let quaternion = new THREE.Quaternion();

  useFrame((state) => {
    if (!playerRef.current) return;
    if (sides == 1) {
      state.camera.setFocalLength(10);
      const velocity = playerRef.current.linvel();
      if (left) {
        tankRef.current.rotation.y += 0.003;
        const deltaX =  tankRef.current.rotation.y;
        setTheta(deltaX);
      }
      if (right) {
        tankRef.current.rotation.y -= 0.003;
        const deltaX =  tankRef.current.rotation.y;
        //setTheta((prevTheta) => (prevTheta - deltaX));
        setTheta(deltaX);
      }
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
      
      const { x, y, z } = playerRef.current.translation();
      let posX = x + radius * Math.sin(theta);
      let posZ = z + radius * Math.cos(theta);
      console.log(posX,posZ,z,Math.cos(theta));
      state.camera.position.set(posX, y + 3, posZ);
      posX = x + radius * Math.sin(theta)*2;
      posZ = z + radius * Math.cos(theta)*2;
      state.camera.lookAt(new Vector3(posX,y+3, posZ));
    }
    if (sides == 0) {
      state.camera.setFocalLength(20);
      const { x, y, z } = playerRef.current.translation();
      state.camera.position.set(x, y + 7, z);
    }
  });
  const switchSide=(event)=>{
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
  };
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
      <RigidBody position={[-1, 1, -2]} ref={playerRef} lockRotations>
        <group ref={tankRef}>
          <Tank position={[0, 0, 0]} statement={sides}/>
        </group>
      </RigidBody>
    </>
  );
};
