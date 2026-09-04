import { findUserById, updateUserProfile } from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const handleGetProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    if (!user) {
      return errorResponse(res, 404, 'User profile not found.');
    }

    return successResponse(res, 200, 'User profile fetched successfully.', {
      id: user.id,
      phoneNumber: user.phone_number,
      name: user.name,
      gender: user.gender,
      avatarUrl: user.avatar_url,
      hasCompletedEmergencySetup: user.has_completed_emergency_setup,
      isSilentSosEnabled: user.is_silent_sos_enabled,
      createdAt: user.created_at,
    });
  } catch (err) {
    next(err);
  }
};

export const handleUpdateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, gender, avatarUrl, hasCompletedEmergencySetup, isSilentSosEnabled, fcmToken } = req.body;

    const updatedUser = await updateUserProfile(userId, {
      name,
      gender,
      avatarUrl,
      hasCompletedEmergencySetup,
      isSilentSosEnabled,
      fcmToken,
    });

    return successResponse(res, 200, 'Profile updated successfully.', {
      id: updatedUser.id,
      phoneNumber: updatedUser.phone_number,
      name: updatedUser.name,
      gender: updatedUser.gender,
      avatarUrl: updatedUser.avatar_url,
      hasCompletedEmergencySetup: updatedUser.has_completed_emergency_setup,
      isSilentSosEnabled: updatedUser.is_silent_sos_enabled,
    });
  } catch (err) {
    next(err);
  }
};
