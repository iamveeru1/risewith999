// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAytkSE0x2Y_CkiczD5aVFcLVppY1cKP2c",
    authDomain: "risewith9-5efa2.firebaseapp.com",
    projectId: "risewith9-5efa2",
    storageBucket: "risewith9-5efa2.firebasestorage.app",
    messagingSenderId: "910982568594",
    appId: "1:910982568594:web:e27d4b55b81fd19795a44b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
