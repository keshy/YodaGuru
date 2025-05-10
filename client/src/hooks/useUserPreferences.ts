import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { UserPreferences } from "@shared/schema";

export function useUserPreferences() {
  const { user } = useAuth();
  const [primaryReligion, setPrimaryReligion] = useState<string>("hinduism");
  
  // Load user preferences
  const { 
    data: preferences, 
    isLoading: isLoadingPreferences,
    error: preferencesError
  } = useQuery({
    queryKey: ['/api/preferences'],
    enabled: !!user
  });
  
  useEffect(() => {
    if (preferences) {
      setPrimaryReligion(preferences.primaryReligion);
    }
  }, [preferences]);
  
  return {
    preferences: preferences as UserPreferences | undefined,
    isLoading: isLoadingPreferences,
    error: preferencesError,
    primaryReligion
  };
}