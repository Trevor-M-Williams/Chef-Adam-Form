import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKYEtzIV287iwR5XSs8ZWIDR2KdhgTyak",
  authDomain: "chef-adam-955fd.firebaseapp.com",
  projectId: "chef-adam-955fd",
  storageBucket: "chef-adam-955fd.appspot.com",
  messagingSenderId: "409856155765",
  appId: "1:409856155765:web:dd75eab9b64596fa48983c",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
