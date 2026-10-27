import { COLLECTIONS } from "../constants/collections";
import {
  createDocument,
  getCollectionLimited,
  getDocument,
  setDocument,
  updateDocument
} from "./firestoreService";

export const getUserProfile = async (uid) => getDocument(COLLECTIONS.users, uid);

export const listUsers = async () => getCollectionLimited(COLLECTIONS.users, 100);

export const saveUserProfile = async (profile, currentUserId) => {
  if (profile.id) {
    await updateDocument(COLLECTIONS.users, profile.id, profile, currentUserId);
    return profile.id;
  }

  if (profile.uid) {
    await setDocument(COLLECTIONS.users, profile.uid, profile, currentUserId);
    return profile.uid;
  }

  return createDocument(COLLECTIONS.users, profile, currentUserId);
};
