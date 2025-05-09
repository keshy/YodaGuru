import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Festival } from "@shared/schema";

interface TodayCardProps {
  festival: Festival;
  loading?: boolean;
}

export default function TodayCard({ festival, loading = false }: TodayCardProps) {
  const [, navigate] = useLocation();
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
        <div className="h-48 w-full bg-neutral-light"></div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h-4 w-24 bg-neutral-light rounded mb-2"></div>
              <div className="h-6 w-48 bg-neutral-light rounded"></div>
            </div>
            <div className="h-8 w-24 bg-neutral-light rounded-full"></div>
          </div>
          <div className="h-20 bg-neutral-light rounded mb-4"></div>
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="h-10 w-32 bg-neutral-light rounded-lg"></div>
            <div className="h-10 w-36 bg-neutral-light rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!festival) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <span className="material-icons text-neutral-dark text-4xl mb-2">event_busy</span>
        <h3 className="font-heading text-xl font-semibold mb-2">No Special Occasion Today</h3>
        <p className="text-neutral-darker mb-4">
          There are no festivals or special occasions for your selected religion today.
        </p>
        <Button 
          variant="outline"
          onClick={() => navigate("/calendar")}
        >
          Check Calendar
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="h-48 w-full overflow-hidden">
        <img 
          src={festival.imageUrl || "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5"} 
          alt={`${festival.name} celebration`}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-neutral-darker">
              {new Date(festival.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <h3 className="font-heading text-xl font-semibold mt-1">{festival.name}</h3>
          </div>
          <span className="px-4 py-1 bg-primary-light/10 text-primary-dark rounded-full text-sm font-medium">
            {festival.religion}
          </span>
        </div>
        
        <p className="mb-4">{festival.description}</p>
        
        <div className="flex flex-wrap gap-3 mt-6">
          <Button
            className="flex items-center"
            onClick={() => navigate(`/priest-mode?festivalId=${festival.id}`)}
          >
            <span className="material-icons mr-2">record_voice_over</span>
            Priest Mode
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => navigate(`/explore?festivalId=${festival.id}`)}
          >
            <span className="material-icons mr-2">play_circle</span>
            Listen to Story
          </Button>
        </div>
      </div>
    </div>
  );
}
