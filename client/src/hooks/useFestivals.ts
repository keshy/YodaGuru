import { useQuery } from "@tanstack/react-query";
import { Festival } from "@shared/schema";

export function useFestivals() {
  // Get all festivals
  const { data: allFestivals = [], isLoading: isLoadingAll } = useQuery<Festival[]>({
    queryKey: ['/api/festivals'],
    enabled: true
  });

  // Get today's festivals
  const { data: todayFestivals = [], isLoading: isLoadingToday } = useQuery<Festival[]>({
    queryKey: ['/api/festivals/today'],
    enabled: true
  });

  // Get upcoming festivals
  const { data: upcomingFestivals = [], isLoading: isLoadingUpcoming } = useQuery<Festival[]>({
    queryKey: ['/api/festivals/upcoming'],
    enabled: true
  });

  // Get a specific festival by ID
  const getFestivalById = (id: number): Festival | undefined => {
    return allFestivals.find((festival: Festival) => festival.id === id);
  };

  // Get festivals by religion
  const getFestivalsByReligion = (religion: string): Festival[] => {
    return allFestivals.filter(
      (festival: Festival) => festival.religion.toLowerCase() === religion.toLowerCase()
    );
  };

  // Format date
  const formatFestivalDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return {
    allFestivals,
    todayFestivals,
    upcomingFestivals,
    isLoadingAll,
    isLoadingToday,
    isLoadingUpcoming,
    getFestivalById,
    getFestivalsByReligion,
    formatFestivalDate
  };
}
