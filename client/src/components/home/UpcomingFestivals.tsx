import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Festival } from "@shared/schema";
import { useState } from "react";

interface UpcomingFestivalsProps {
  festivals: Festival[];
  loading?: boolean;
}

export default function UpcomingFestivals({ festivals, loading = false }: UpcomingFestivalsProps) {
  const [, navigate] = useLocation();
  const [notifiedFestivals, setNotifiedFestivals] = useState<number[]>([]);
  
  const toggleNotification = (festivalId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setNotifiedFestivals(prev => 
      prev.includes(festivalId) 
        ? prev.filter(id => id !== festivalId)
        : [...prev, festivalId]
    );
  };
  
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl font-semibold">Upcoming Festivals</h3>
          <div className="w-28 h-6 bg-neutral-light rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-neutral-light rounded-lg mr-4"></div>
                <div>
                  <div className="h-5 w-32 bg-neutral-light rounded mb-1"></div>
                  <div className="h-4 w-48 bg-neutral-light rounded"></div>
                </div>
              </div>
              <div>
                <div className="h-6 w-6 bg-neutral-light rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!festivals || festivals.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl font-semibold">Upcoming Festivals</h3>
          <Button 
            variant="link"
            className="text-primary hover:text-primary-dark"
            onClick={() => navigate("/calendar")}
          >
            View Calendar
          </Button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <span className="material-icons text-neutral-dark text-4xl mb-2">event_busy</span>
          <h4 className="font-medium mb-2">No Upcoming Festivals</h4>
          <p className="text-neutral-darker">
            There are no upcoming festivals for your selected religion.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-xl font-semibold">Upcoming Festivals</h3>
        <Button 
          variant="link"
          className="text-primary hover:text-primary-dark"
          onClick={() => navigate("/calendar")}
        >
          View Calendar
        </Button>
      </div>
      
      <div className="space-y-4">
        {festivals.map((festival) => (
          <div 
            key={festival.id} 
            className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/calendar?festivalId=${festival.id}`)}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-light/20 rounded-lg flex items-center justify-center mr-4">
                <span className="material-icons text-primary">calendar_today</span>
              </div>
              <div>
                <h4 className="font-heading font-medium">{festival.name}</h4>
                <p className="text-sm text-neutral-darker">
                  {new Date(festival.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} • {festival.religion}
                </p>
              </div>
            </div>
            <div>
              <Button
                variant="ghost"
                size="icon"
                className={notifiedFestivals.includes(festival.id) ? "text-primary" : "text-neutral-darker hover:text-primary"}
                onClick={(e) => toggleNotification(festival.id, e)}
              >
                <span className="material-icons">
                  {notifiedFestivals.includes(festival.id) ? "notifications_active" : "notifications_none"}
                </span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
