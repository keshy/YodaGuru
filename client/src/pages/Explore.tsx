import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useFestivals } from "@/hooks/useFestivals";
import { useRituals } from "@/hooks/useRituals";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Festival, Ritual, Bhajan } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export default function Explore() {
  const [location] = useLocation();
  const festivalParam = new URLSearchParams(location.split("?")[1]).get("festivalId");
  const festivalId = festivalParam ? parseInt(festivalParam) : undefined;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  const { allFestivals, isLoadingAll } = useFestivals();
  const { playRitualText, isPlaying, stopPlayback } = useRituals();
  const { primaryReligion, isLoading: isLoadingPreferences } = useUserPreferences();
  
  // Get bhajans
  const { data: bhajans, isLoading: isLoadingBhajans } = useQuery({
    queryKey: ['/api/bhajans/festival', festivalId],
    enabled: !!festivalId
  });
  
  useEffect(() => {
    // Clean up audio on unmount
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);
  
  // Filter content based on search and type, using user's primaryReligion
  const filteredContent = () => {
    const query = searchQuery.toLowerCase();
    let festivalList: Festival[] = [];
    let bhajanList: Bhajan[] = [];
    
    if (allFestivals) {
      festivalList = allFestivals.filter((festival: Festival) => 
        (query === "" || 
         festival.name.toLowerCase().includes(query) || 
         festival.description.toLowerCase().includes(query)) &&
        (festival.religion.toLowerCase() === primaryReligion?.toLowerCase())
      );
    }
    
    if (bhajans && Array.isArray(bhajans)) {
      bhajanList = bhajans.filter((bhajan: Bhajan) =>
        (query === "" || 
         bhajan.title.toLowerCase().includes(query)) &&
        (bhajan.religion.toLowerCase() === primaryReligion?.toLowerCase())
      );
    }
    
    return {
      festivals: selectedType === "bhajans" ? [] : festivalList,
      bhajans: bhajanList
    };
  };
  
  const { festivals, bhajans: filteredBhajans } = filteredContent();
  
  const playStory = (text: string) => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playRitualText(text);
    }
  };
  
  if (isLoadingAll || isLoadingBhajans) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mb-4"></div>
        <p className="text-neutral-darker">Loading content...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold mb-6">Explore Spiritual Content</h2>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search festivals, rituals, stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              prefix={<span className="material-icons text-neutral-dark">search</span>}
            />
          </div>
          
          <div className="w-full md:w-48">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Content" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="festivals">Festivals</SelectItem>
                <SelectItem value="bhajans">Bhajans & Music</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {primaryReligion && (
          <div className="bg-primary-lighter/20 border border-primary-lighter rounded-md p-3 flex items-center">
            <span className="material-icons text-primary-dark mr-2">info</span>
            <p className="text-sm text-primary-dark">
              Showing content for your preferred religion: <span className="font-medium capitalize">{primaryReligion}</span>
            </p>
          </div>
        )}
      </div>
      
      {/* Results Section */}
      <div className="space-y-8">
        {/* Festivals */}
        {(selectedType === "all" || selectedType === "festivals") && (
          <div>
            <h3 className="font-heading text-xl font-semibold mb-4">Festivals & Celebrations</h3>
            
            {festivals.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <span className="material-icons text-neutral-dark text-4xl mb-2">event_busy</span>
                  <h4 className="font-medium mb-2">No Festivals Found</h4>
                  <p className="text-neutral-darker">
                    Try adjusting your search or filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {festivals.map((festival: Festival) => (
                  <Card key={festival.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-neutral-light overflow-hidden">
                      {festival.imageUrl ? (
                        <img 
                          src={festival.imageUrl} 
                          alt={festival.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-icons text-5xl text-neutral-dark">celebration</span>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-heading font-medium text-lg">{festival.name}</h4>
                        <span className="px-2 py-1 bg-primary-light/10 text-primary-dark rounded-full text-xs font-medium">
                          {festival.religion}
                        </span>
                      </div>
                      
                      <p className="text-sm text-neutral-darker mb-4 line-clamp-2">
                        {festival.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-neutral-darker">
                          {new Date(festival.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        
                        {festival.story && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex items-center text-primary hover:text-primary-dark"
                            onClick={() => playStory(festival.story || "")}
                          >
                            <span className="material-icons mr-1 text-sm">
                              {isPlaying ? "pause" : "play_arrow"}
                            </span>
                            Listen
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Bhajans */}
        {(selectedType === "all" || selectedType === "bhajans") && (
          <div>
            <h3 className="font-heading text-xl font-semibold mb-4">Bhajans & Devotional Music</h3>
            
            {filteredBhajans.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <span className="material-icons text-neutral-dark text-4xl mb-2">music_off</span>
                  <h4 className="font-medium mb-2">No Bhajans Found</h4>
                  <p className="text-neutral-darker">
                    Try adjusting your search or filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBhajans.map((bhajan: Bhajan) => (
                  <Card key={bhajan.id} className="overflow-hidden">
                    <div className="w-full h-48 bg-neutral-light flex items-center justify-center">
                      <span className="material-icons text-5xl text-neutral-dark">music_note</span>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-heading font-medium mb-1">{bhajan.title}</h4>
                      <p className="text-sm text-neutral-darker mb-3">{bhajan.type} • {bhajan.duration}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary hover:text-primary-dark"
                          >
                            <span className="material-icons">play_circle</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 text-neutral-darker hover:text-neutral-darkest"
                          >
                            <span className="material-icons">playlist_add</span>
                          </Button>
                        </div>
                        <Button
                          variant="link"
                          className="text-sm text-primary hover:text-primary-dark flex items-center"
                          onClick={() => window.open(bhajan.youtubeUrl, '_blank')}
                        >
                          YouTube <span className="material-icons text-sm ml-1">open_in_new</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
