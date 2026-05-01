import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEtT0dbjTKRayKTYpvOuV6hFhjEAjIo-M",
  authDomain: "trex-ai-8eb81.firebaseapp.com",
  projectId: "trex-ai-8eb81",
  storageBucket: "trex-ai-8eb81.firebasestorage.app",
  messagingSenderId: "922123469227",
  appId: "1:922123469227:web:247f3c35cf0315dce892ee",
  measurementId: "G-VH3TQTT2XS"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const db = getFirestore(app);

export { app, auth, analytics, db };
