import { COLLECTIONS } from "../constants/collections";
import {
  createDocument,
  getCollectionLimited,
  removeDocument,
  updateDocument
} from "./firestoreService";

export const listLocations = async () => getCollectionLimited(COLLECTIONS.locations, 100);

export const createLocation = async (location, user) =>
  createDocument(COLLECTIONS.locations, location, user?.uid);

export const updateLocation = async (locationId, location, user) =>
  updateDocument(COLLECTIONS.locations, locationId, location, user?.uid);

export const deleteLocation = async (locationId) => removeDocument(COLLECTIONS.locations, locationId);
