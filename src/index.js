import React from 'react';
import AemulusCanvas from './components/AemulusCanvas';

export function Aemulus({
        id, 
        apiKey, 
        authDomain, 
        projectId, 
        storageBucket, 
        messagingSenderId,
        appId, 
        measurementId
    }) {
    return (
        <>
            <AemulusCanvas 
                id={id} 
                apiKey={apiKey} 
                authDomain={authDomain} 
                projectId={projectId} 
                storageBucket={storageBucket}
                messagingSenderId={messagingSenderId}
                appId={appId}
                measurementId={measurementId}
            />
        </>
    )
}

export default Aemulus;