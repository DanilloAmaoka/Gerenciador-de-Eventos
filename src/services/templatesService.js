import { COLLECTIONS } from "../constants/collections";
import {
  createDocument,
  getCollectionLimited,
  removeDocument,
  updateDocument
} from "./firestoreService";

export const listTemplates = async () => getCollectionLimited(COLLECTIONS.eventTemplates, 100);

export const createTemplate = async (template, user) =>
  createDocument(COLLECTIONS.eventTemplates, template, user?.uid);

export const updateTemplate = async (templateId, template, user) =>
  updateDocument(COLLECTIONS.eventTemplates, templateId, template, user?.uid);

export const deleteTemplate = async (templateId) =>
  removeDocument(COLLECTIONS.eventTemplates, templateId);
