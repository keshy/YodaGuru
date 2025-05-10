import { useState, useEffect } from "react";
import { useFestivals } from "@/hooks/useFestivals";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useLocation } from "wouter";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RELIGIONS } from "@/lib/constants";
import { Festival } from "@shared/schema";

export default function Calendar() {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const festivalParam = new URLSearchParams(location.split("?")[1]).get("festivalId");
  
  const { allFestivals, isLoadingAll } = useFestivals();
  const { primaryReligion, isLoading: isLoadingPreferences } = useUserPreferences();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedReligion, setSelectedReligion] = useState<string>("all");
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  
  // Set religion filter based on user preferences when loaded
  useEffect(() => {
    if (primaryReligion && !festivalParam) {
      setSelectedReligion(primaryReligion.toLowerCase());
    }
  }, [primaryReligion, festivalParam]);
  
  // Format festival dates for calendar highlighting
  const festivalDates = allFestivals
    ? allFestivals
        .filter((festival: Festival) => 
          selectedReligion === "all" || selectedReligion === "" || 
          festival.religion.toLowerCase() === selectedReligion.toLowerCase()
        )
        .map((festival: Festival) => new Date(festival.date))
    : [];
  
  // Get festivals for selected date
  const getFestivalsForDate = (date: Date): Festival[] => {
    if (!allFestivals) return [];
    
    const selectedDateStr = date.toISOString().split('T')[0];
    
    return allFestivals.filter((festival: Festival) => {
      const festivalDate = new Date(festival.date);
      const festivalDateStr = festivalDate.toISOString().split('T')[0];
      
      return (
        festivalDateStr === selectedDateStr &&
        (selectedReligion === "all" || selectedReligion === "" || 
         festival.religion.toLowerCase() === selectedReligion.toLowerCase())
      );
    });
  };
  
  // Festivals for the selected date
  const [dateFetivals, setDateFestivals] = useState<Festival[]>([]);
  
  useEffect(() => {
    if (selectedDate) {
      setDateFestivals(getFestivalsForDate(selectedDate));
    }
  }, [selectedDate, allFestivals, selectedReligion]);
  
  // If a festival ID is provided in URL, select that festival
  useEffect(() => {
    if (festivalParam && allFestivals) {
      const festival = allFestivals.find(
        (f: Festival) => f.id === parseInt(festivalParam)
      );
      
      if (festival) {
        setSelectedFestival(festival);
        setSelectedDate(new Date(festival.date));
        setSelectedReligion(festival.religion.toLowerCase());
      }
    }
  }, [festivalParam, allFestivals]);
  
  if (isLoadingAll) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mb-4"></div>
        <p className="text-neutral-darker">Loading calendar...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold mb-6">Festival Calendar</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar and Filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              {primaryReligion && selectedReligion !== "all" && (
                <div className="bg-primary-lighter/20 border border-primary-lighter rounded-md p-3 mb-4 flex items-center">
                  <span className="material-icons text-primary-dark mr-2">info</span>
                  <p className="text-sm text-primary-dark">
                    Showing festivals for your preferred religion: <span className="font-medium capitalize">{primaryReligion}</span>
                  </p>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block font-medium mb-2">Filter by Religion</label>
                <Select value={selectedReligion} onValueChange={setSelectedReligion}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Religions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Religions</SelectItem>
                    {RELIGIONS.map((religion) => (
                      <SelectItem key={religion.value} value={religion.value}>
                        {religion.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border rounded-md p-3 mb-6">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    festival: festivalDates
                  }}
                  modifiersStyles={{
                    festival: {
                      backgroundColor: 'rgba(126, 87, 194, 0.1)',
                      borderRadius: '50%',
                      color: '#7E57C2',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </div>
              
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-primary-light/20 rounded-full mr-2"></div>
                <span className="text-sm">Festival Day</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Festival Details */}
        <div className="lg:col-span-2">
          {selectedFestival ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-xl font-semibold">{selectedFestival.name}</h3>
                    <p className="text-neutral-darker">
                      {new Date(selectedFestival.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-primary-light/10 text-primary-dark rounded-full text-sm font-medium">
                    {selectedFestival.religion}
                  </span>
                </div>
                
                <p className="mb-6">{selectedFestival.description}</p>
                
                {selectedFestival.story && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Story & Origins</h4>
                    <div className="bg-neutral-light p-4 rounded-lg">
                      <p className="font-spiritual text-lg">{selectedFestival.story}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button
                    className="flex items-center"
                    onClick={() => navigate(`/priest-mode?festivalId=${selectedFestival.id}`)}
                  >
                    <span className="material-icons mr-2">record_voice_over</span>
                    Priest Mode
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex items-center"
                    onClick={() => navigate(`/explore?festivalId=${selectedFestival.id}`)}
                  >
                    <span className="material-icons mr-2">play_circle</span>
                    Listen to Story
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="flex items-center"
                    onClick={() => setSelectedFestival(null)}
                  >
                    <span className="material-icons mr-2">arrow_back</span>
                    Back to List
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h3 className="font-heading text-xl font-semibold">
                {selectedDate
                  ? `Festivals on ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                  : "All Upcoming Festivals"}
              </h3>
              
              {dateFetivals.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <span className="material-icons text-neutral-dark text-4xl mb-2">event_busy</span>
                    <h4 className="font-medium mb-2">No Festivals on This Date</h4>
                    <p className="text-neutral-darker">
                      Select another date or change the religion filter to find festivals
                    </p>
                  </CardContent>
                </Card>
              ) : (
                dateFetivals.map((festival) => (
                  <Card 
                    key={festival.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedFestival(festival)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-heading font-medium text-lg">{festival.name}</h4>
                          <p className="text-neutral-darker text-sm mb-2">
                            {new Date(festival.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm line-clamp-2">{festival.description}</p>
                        </div>
                        <span className="px-3 py-1 bg-primary-light/10 text-primary-dark rounded-full text-sm font-medium ml-4">
                          {festival.religion}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
