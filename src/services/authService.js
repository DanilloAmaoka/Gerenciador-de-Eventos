import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth } from "../firebase/config";

export const signIn = async ({ email, password }) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const signOutUser = () => signOut(auth);

export const requestPasswordReset = (email) => sendPasswordResetEmail(auth, email);
