import {Model} from "./tankModel.jsx";
import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import {useEffect, useRef, useState} from "react";
import {useFrame} from "@react-three/fiber";

const recoilDuration = 100;
const easing = TWEEN.Easing.Quadratic.Out;

export const Tank = (props) => {
    const TRef=useRef();
    
    const [recoilAnimation, setRecoilAnimation] = useState(null);
    const [recoilBackAnimation, setRecoilBackAnimation] = useState(null);
    
    //get pos while animation
    const genNewPos=(currentPosition)=>{
        const recoilOffset = new THREE.Vector3(0,0,-0.5);
        return currentPosition.clone().add(recoilOffset);
    }

    //animation function
    const initRecoilAnimation = () => {
        const currentPosition = new THREE.Vector3(0, 0, 0);
        const initialPosition = new THREE.Vector3(0, 0, 0);
        const newPosition = genNewPos(currentPosition);

        const twRecoilAnimation = new TWEEN.Tween(currentPosition)
            .to(newPosition, recoilDuration)
            .easing(easing)
            .onUpdate(() => {
                TRef.current.position.copy(currentPosition);
            });

        const twRecoilBackAnimation = new TWEEN.Tween(currentPosition)
            .to(initialPosition, recoilDuration)
            .easing(easing)
            .onUpdate(() => {
                TRef.current.position.copy(currentPosition);
            });

        twRecoilAnimation.chain(twRecoilBackAnimation);

        setRecoilAnimation(twRecoilAnimation);
        setRecoilBackAnimation(twRecoilBackAnimation);
    }

    useEffect(() => {
        
        const shootHandler=(event)=>{
            if (event.button==0 && props.statement===2){
                props.setisShoot(true);
                recoilAnimation.start();
            }
        }
        document.addEventListener('mousedown', shootHandler);
        initRecoilAnimation();
        return ()=>{
            document.removeEventListener('mousedown', shootHandler);
        }
    }, [props.statement]);

    useFrame(() => {
        TWEEN.update();
    });

    return (
        
        <group >
            <group ref={TRef}>
                <Model {...props.position}/>
            </group>
        </group>
    );
}