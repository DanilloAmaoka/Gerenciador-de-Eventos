import { limit, query, where, collection, getDocs } from "firebase/firestore";
import { COLLECTIONS } from "../constants/collections";
import { db } from "../firebase/config";
import {
  createDocument,
  getDocument,
  updateDocument
} from "./firestoreService";

const normalizeEvent = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data()
});

export const listEvents = async ({ includeArchived = false } = {}) => {
  const constraints = includeArchived
    ? [limit(120)]
    : [where("archived", "==", false), limit(120)];

  const snapshot = await getDocs(query(collection(db, COLLECTIONS.events), ...constraints));
  return snapshot.docs.map(normalizeEvent);
};

export const getEvent = async (eventId) => getDocument(COLLECTIONS.events, eventId);

export const createEvent = async (event, user) => {
  const userId = user?.uid || null;

  return createDocument(
    COLLECTIONS.events,
    {
      ...event,
      archived: false,
      ownerId: userId,
      memberIds: userId ? [userId] : [],
      startDateTime: event.startDateTime || null,
      endDateTime: event.endDateTime || null,
      estimatedAudience: Number(event.estimatedAudience || 0),
      budgetLimit: Number(event.budgetLimit || 0)
    },
    userId
  );
};

export const updateEvent = async (eventId, event, user) => {
  await updateDocument(
    COLLECTIONS.events,
    eventId,
    {
      ...event,
      estimatedAudience: Number(event.estimatedAudience || 0),
      budgetLimit: Number(event.budgetLimit || 0)
    },
    user?.uid
  );
};

export const archiveEvent = async (eventId, user) => {
  await updateDocument(
    COLLECTIONS.events,
    eventId,
    {
      archived: true,
      status: "arquivado"
    },
    user?.uid
  );
};
