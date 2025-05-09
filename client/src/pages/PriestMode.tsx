import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useRituals } from "@/hooks/useRituals";
import { Button } from "@/components/ui/button";
import RitualPlayer from "@/components/priest/RitualPlayer";
import { Ritual } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

export default function PriestMode() {
  const [location] = useLocation();
  const festivalId = new URLSearchParams(location.split("?")[1]).get("festivalId");
  const { festivalRituals, isLoading, currentRitual, setCurrentRitual } = useRituals(
    festivalId ? parseInt(festivalId) : undefined
  );
  const [selectedRitualId, setSelectedRitualId] = useState<number | null>(null);
  
  // Set first ritual as selected when data loads
  useEffect(() => {
    if (festivalRituals && festivalRituals.length > 0 && !selectedRitualId) {
      setSelectedRitualId(festivalRituals[0].id);
    }
  }, [festivalRituals, selectedRitualId]);
  
  const handleSelectRitual = (ritual: Ritual) => {
    setSelectedRitualId(ritual.id);
    setCurrentRitual(ritual);
  };
  
  const handleBackToList = () => {
    setSelectedRitualId(null);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mb-4"></div>
        <p className="text-neutral-darker">Loading rituals...</p>
      </div>
    );
  }
  
  if (!festivalRituals || festivalRituals.length === 0) {
    return (
      <div>
        <h2 className="font-heading text-2xl font-semibold mb-6">Priest Mode</h2>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <span className="material-icons text-neutral-dark text-5xl mb-4">auto_stories</span>
            <h3 className="font-heading text-xl font-semibold mb-2">No Rituals Available</h3>
            <p className="text-neutral-darker text-center mb-4">
              There are no ritual procedures available at the moment.
            </p>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (selectedRitualId && currentRitual) {
    return <RitualPlayer ritual={currentRitual} onBack={handleBackToList} />;
  }
  
  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold mb-6">Priest Mode</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {festivalRituals.map((ritual) => (
          <Card key={ritual.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-semibold">{ritual.title}</h3>
                <span className="px-3 py-1 bg-primary-light/10 text-primary rounded-full text-xs font-medium">
                  {ritual.religion}
                </span>
              </div>
              
              <p className="text-neutral-darker text-sm mb-6 line-clamp-3">
                {ritual.description}
              </p>
              
              <div className="flex flex-wrap items-center justify-between mt-4">
                <div className="flex items-center text-sm text-neutral-darker">
                  <span className="material-icons text-sm mr-1">format_list_numbered</span>
                  {Array.isArray(ritual.steps) 
                    ? ritual.steps.length 
                    : JSON.parse(ritual.steps as string).length} steps
                </div>
                
                <Button 
                  onClick={() => handleSelectRitual(ritual)}
                  className="mt-2 w-full sm:w-auto"
                >
                  <span className="material-icons mr-2">record_voice_over</span>
                  Start Guidance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
