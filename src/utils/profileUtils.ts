import { User } from '../store/useAuthStore';

/**
 * Checks if user profile is complete
 * Required fields: gender, dob, time_of_birth, place_of_birth, relationship_status, sign_in_zodiac
 */
export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;

  return (
    !!user.gender &&
    !!user.dob &&
    !!user.time_of_birth &&
    !!user.place_of_birth &&
    !!user.relationship_status &&
    !!user.sign_in_zodiac
  );
};
