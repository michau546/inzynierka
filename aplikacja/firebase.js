// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import Constants from 'expo-constants';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9Txyz0DpfQSLX2KfNlJ0t7qtBqJqg4Qk",
  authDomain: "inzynierka-89c6c.firebaseapp.com",
  projectId: "inzynierka-89c6c",
  storageBucket: "inzynierka-89c6c.appspot.com",
  messagingSenderId: "289050689794",
  appId: "1:289050689794:web:7c8f5c1ce2af915da2421b",
  measurementId: "G-1RWQV2SVD9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const storage = getStorage(app);