import { getContactsByUserId, addEmergencyContact, deleteEmergencyContact } from '../models/contact.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const handleGetContacts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contacts = await getContactsByUserId(userId);
    return successResponse(res, 200, 'Emergency contacts retrieved.', contacts.map((c) => ({
      id: c.id,
      name: c.name,
      phoneNumber: c.phone_number,
      relationship: c.relationship,
      isPrimary: c.is_primary,
    })));
  } catch (err) {
    next(err);
  }
};

export const handleAddContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phoneNumber, relationship, isPrimary } = req.body;

    const contact = await addEmergencyContact(userId, { name, phoneNumber, relationship, isPrimary });
    return successResponse(res, 201, 'Emergency contact added successfully.', {
      id: contact.id,
      name: contact.name,
      phoneNumber: contact.phone_number,
      relationship: contact.relationship,
      isPrimary: contact.is_primary,
    });
  } catch (err) {
    next(err);
  }
};

export const handleDeleteContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { contactId } = req.params;

    const deleted = await deleteEmergencyContact(contactId, userId);
    if (!deleted) {
      return errorResponse(res, 404, 'Emergency contact not found.');
    }

    return successResponse(res, 200, 'Emergency contact deleted successfully.');
  } catch (err) {
    next(err);
  }
};
