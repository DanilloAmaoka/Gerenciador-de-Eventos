import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "../firebase/config";

const removeUndefinedValues = (value) => {
  if (Array.isArray(value)) {
    return value.map(removeUndefinedValues);
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.entries(value).reduce((result, [key, entryValue]) => {
      if (entryValue !== undefined) {
        result[key] = removeUndefinedValues(entryValue);
      }

      return result;
    }, {});
  }

  return value;
};

const normalizeDocument = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data()
});

export const getCollection = async (collectionName, constraints = []) => {
  const reference = collection(db, collectionName);
  const snapshot = await getDocs(query(reference, ...constraints));
  return snapshot.docs.map(normalizeDocument);
};

export const getCollectionLimited = async (collectionName, maxResults = 100) =>
  getCollection(collectionName, [limit(maxResults)]);

export const getOrderedCollection = async (collectionName, field, direction = "asc", maxResults = 100) =>
  getCollection(collectionName, [orderBy(field, direction), limit(maxResults)]);

export const getWhereCollection = async (collectionName, field, operator, value, maxResults = 100) =>
  getCollection(collectionName, [where(field, operator, value), limit(maxResults)]);

export const getDocument = async (collectionName, documentId) => {
  const snapshot = await getDoc(doc(db, collectionName, documentId));
  return snapshot.exists() ? normalizeDocument(snapshot) : null;
};

export const createDocument = async (collectionName, data, userId) => {
  const payload = removeUndefinedValues({
    ...data,
    createdAt: serverTimestamp(),
    createdBy: userId || null,
    updatedAt: serverTimestamp(),
    updatedBy: userId || null
  });

  const reference = await addDoc(collection(db, collectionName), payload);
  return reference.id;
};

export const setDocument = async (collectionName, documentId, data, userId) => {
  const payload = removeUndefinedValues({
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: userId || null
  });

  await setDoc(doc(db, collectionName, documentId), payload, { merge: true });
};

export const updateDocument = async (collectionName, documentId, data, userId) => {
  const payload = removeUndefinedValues({
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: userId || null
  });

  await updateDoc(doc(db, collectionName, documentId), payload);
};

export const removeDocument = async (collectionName, documentId) => {
  await deleteDoc(doc(db, collectionName, documentId));
};
