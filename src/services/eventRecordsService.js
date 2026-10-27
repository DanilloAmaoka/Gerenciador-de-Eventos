import { COLLECTIONS } from "../constants/collections";
import {
  createDocument,
  getWhereCollection,
  removeDocument,
  updateDocument
} from "./firestoreService";

const EVENT_RECORD_COLLECTIONS = new Set([
  COLLECTIONS.eventFood,
  COLLECTIONS.eventExpenses,
  COLLECTIONS.eventItems,
  COLLECTIONS.eventTasks,
  COLLECTIONS.eventSchedule,
  COLLECTIONS.eventPeople,
  COLLECTIONS.eventDocuments,
  COLLECTIONS.eventHistory,
  COLLECTIONS.eventLocations
]);

const ensureEventCollection = (collectionName) => {
  if (!EVENT_RECORD_COLLECTIONS.has(collectionName)) {
    throw new Error("Coleção de evento não permitida.");
  }
};

export const listEventRecords = async (collectionName, eventId) => {
  ensureEventCollection(collectionName);
  return getWhereCollection(collectionName, "eventId", "==", eventId, 200);
};

export const createEventRecord = async (collectionName, eventId, data, user) => {
  ensureEventCollection(collectionName);
  return createDocument(
    collectionName,
    {
      ...data,
      eventId
    },
    user?.uid
  );
};

export const updateEventRecord = async (collectionName, recordId, data, user) => {
  ensureEventCollection(collectionName);
  return updateDocument(collectionName, recordId, data, user?.uid);
};

export const deleteEventRecord = async (collectionName, recordId) => {
  ensureEventCollection(collectionName);
  return removeDocument(collectionName, recordId);
};
