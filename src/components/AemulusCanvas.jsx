import GsViewer from "./GsViewer";
import React from "react";
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage"
import { useEffect, useState } from "react";

async function get_url_firebase(id, firebaseConfig) {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app, 'version-1');
    const storage = getStorage(app, "gs://aemulusai.appspot.com");
    const viewerDoc = await getDoc(doc(db, 'viewers', id));
    const viewerData = viewerDoc.data();
    const gaussian_path = viewerData['gaussian_path'];

    if (gaussian_path === undefined || gaussian_path === null || gaussian_path === "") {
        return new Promise((resolve, reject) => {
            resolve(null);
        }   
        );
    }

    const plyRef = ref(storage, gaussian_path);

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

export function AemulusCanvas({id, apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId}) {
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [error, setError] = useState(null); // State to manage any potential errors
    const [url, setUrl] = useState(null); // State to manage the URL of the Gaussian splats
    
    useEffect(() => {
        async function fetchData() {
            try {
                const firebaseConfig = {
                    apiKey: apiKey,
                    authDomain: authDomain,
                    projectId: projectId,
                    storageBucket: storageBucket,
                    messagingSenderId: messagingSenderId,
                    appId: appId,
                    measurementId: measurementId
                };
                const tmp_url = await get_url_firebase(id, firebaseConfig);
                setLoading(false);
                setUrl(tmp_url);
            }
            catch (error) {
                setError(error);
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    
    return (
        <div>
            <GsViewer url={url}/>
        </div>
    )
}

export default AemulusCanvas;