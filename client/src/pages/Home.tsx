import { useEffect } from "react";
import TodayCard from "@/components/home/TodayCard";
import MythologySection from "@/components/home/MythologySection";
import MusicSection from "@/components/home/MusicSection";
import UpcomingFestivals from "@/components/home/UpcomingFestivals";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { user } = useAuth();

  // Get today's festival based on user's primary religion
  const { data: preferences } = useQuery({
    queryKey: ['/api/preferences'],
    enabled: !!user
  });
  
  const { data: todayFestival, isLoading: isLoadingTodayFestival } = useQuery({
    queryKey: ['/api/festivals/today'],
    enabled: true
  });

  const { data: upcomingFestivals, isLoading: isLoadingUpcomingFestivals } = useQuery({
    queryKey: ['/api/festivals/upcoming'],
    enabled: !!user
  });
  
  // Get festival that matches user's religion
  const userFestival = todayFestival?.find((festival: any) => 
    preferences?.primaryReligion?.toLowerCase() === festival.religion.toLowerCase()
  );
  
  // If no festival matches user's religion, use the first one
  const festival = userFestival || (todayFestival?.length > 0 ? todayFestival[0] : null);
  
  return (
    <div>
      {/* Welcome Section */}
      <section className="mb-8">
        <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-2">
          Namaste, {user?.firstName || "Friend"}
        </h2>
        <p className="text-neutral-darker">May peace be with you on this blessed day</p>
      </section>
      
      {/* Today's Special Occasion Card */}
      <section className="mb-8">
        <TodayCard 
          festival={festival} 
          loading={isLoadingTodayFestival}
        />
      </section>
      
      {/* Mythology & Origins Section */}
      <section className="mb-8">
        <MythologySection 
          festival={festival} 
          loading={isLoadingTodayFestival}
        />
      </section>
      
      {/* Bhajans & Music Section */}
      <section className="mb-8">
        <MusicSection festivalId={festival?.id} />
      </section>
      
      {/* Upcoming Festivals Section */}
      <section>
        <UpcomingFestivals 
          festivals={upcomingFestivals || []} 
          loading={isLoadingUpcomingFestivals}
        />
      </section>
    </div>
  );
}
