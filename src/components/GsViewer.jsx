import { useEffect, useRef, useState } from "react";
import { GsRenderer } from './GsRenderer';
import * as THREE from 'three';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from "firebase/storage"
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';


function get_url(path, figconfig, local=false) {
    if (!local) {        
        const app = initializeApp(figconfig);
        const storage = getStorage(app, "gs://aemulusai.appspot.com");
        const plyRef = ref(storage, path);

        return new Promise((resolve, reject) => {
            getDownloadURL(plyRef)
            .then((url) => {
                resolve(url);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }
    else {
        return new Promise((resolve, reject) => {
            resolve(path);
        });  
    }
}


function GsViewer({ url }) {
    const ref = useRef();
    const rendererRef = useRef();
    const gsRendererRef = useRef();
    let counterRef = useRef(0);

    const height = 512;
    const width = 512;

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            // Your logic here
            console.log('User is leaving the page');
            
            // Standard way to trigger a confirmation dialog
            // event.preventDefault();
            if (gsRendererRef.current !== undefined) {
                gsRendererRef.current.dispose();
            }
        };  

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            console.log("removing event listener");
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);


    useEffect(() => {
        if (url === null || url === undefined || url === "") {
            const ctx = ref.current.getContext('2d');
            ctx.font = "42px Arial";
            ctx.fillStyle = "white";
            ctx.fillText("No render uploaded", 10, height/2)
            return ;
        }

        const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
        camera.position.copy(new THREE.Vector3().fromArray([-182.66668, 11.60506, -148.92582]));
        camera.up = new THREE.Vector3().fromArray([0.00000, -0.85749, -0.51450]).normalize();
        // create renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            canvas: ref.current,
        });
        
        rendererRef.current = renderer;

        // init viewer
        const gsRenderer = new GsRenderer({
            'renderer': renderer,
            'camera': camera,
            'sphericalHarmonicsDegree': 0,
            'gpuAcceleratedSort': true,
            'sceneRevealMode': GaussianSplats3D.SceneRevealMode.Default,
            'initialCameraLookAt': [-185.08297, 24.60055, -130.08352],
            'fullScreenControl': true,
            'sharedMemoryForWorkers': false,
        });
        gsRendererRef.current = gsRenderer;

        // get url to ply file
        console.log("adding url to renderer", url);
        gsRenderer.addSplatScene(url, {
            'format': GaussianSplats3D.SceneFormat.Ply,
            'showLoadingUI': false,
            'progressiveLoad': false,
        })
        .then(() => {
            console.log("starting viewer");
            gsRenderer.start();
        });
        
        return () => {
            rendererRef.current.dispose();
            gsRendererRef.current.dispose();
        }
    }, []);

    return (
        <div>
            <canvas
            id="gs"
            alt="Product Image"
            width={width}
            height={height}
            className="w-full h-auto object-cover border rounded-lg overflow-hidden"
            style={{ aspectRatio: "800/800", objectFit: "cover" }} 
            ref={ref}></canvas>
        </div>
    );
}

export default GsViewer;