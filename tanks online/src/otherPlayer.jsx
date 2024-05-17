import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Tank } from "./tank.jsx";
import {Vector3} from "three";

const direction = new THREE.Vector3();

export const OtherPlayer = ({id,x,y,z,rotation,shoot}) => {
  const playerRef = useRef();
  const [isShoot,setIsShooted] = useState(0);
  let counterAnim=0;
  const radius = 3;
  const tankRef = useRef();
  let quaternion = new THREE.Quaternion();

  useFrame(() => {
    const velocity = playerRef.current.linvel();
    playerRef.current.setLinvel({
      x: 0,
      y: velocity.y,
      z: 0,
    })
    setIsShooted(shoot);
    playerRef.current.wakeUp();
    tankRef.current.rotation.y = rotation;
    playerRef.current.position=[x,y,z];

    //animate camera when shooting
    if (isShoot||counterAnim>0){
      counterAnim++;
      if(counterAnim>30){
       setIsShooted(false);
       counterAnim=0;
      }
    }
  });
  
//initialize component
  useEffect(() => {
    tankRef.current.rotation.y = Math.PI;
    direction.set(1, 0, 0);
  }, []);

  return (
    <>
      <RigidBody position={[x,y,z]} ref={playerRef} lockRotations>
        <group ref={tankRef}>
          <Tank position={[0, 0, 0]} id = {id} statement={3} setisShoot={setIsShooted}/>
        </group>
      </RigidBody>
    </>
  );
};
