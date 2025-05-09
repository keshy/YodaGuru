import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Festival } from "@shared/schema";

interface MythologySectionProps {
  festival: Festival;
  loading?: boolean;
}

export default function MythologySection({ festival, loading = false }: MythologySectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      // Simulate progress for demo purposes
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };
  
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl font-semibold">Mythology & Origins</h3>
          <div className="w-16 h-6 bg-neutral-light rounded animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <div className="h-6 w-48 bg-neutral-light rounded mb-4"></div>
          <div className="h-20 bg-neutral-light rounded mb-4"></div>
          <div className="h-20 bg-neutral-light rounded mb-6"></div>
          <div className="bg-neutral-light rounded-lg p-4 h-20"></div>
        </div>
      </div>
    );
  }
  
  if (!festival) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl font-semibold">Mythology & Origins</h3>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <span className="material-icons text-neutral-dark text-4xl mb-2">auto_stories</span>
          <h4 className="font-medium mb-2">No Story Available</h4>
          <p className="text-neutral-darker">
            Select a festival to view its mythology and origins.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-xl font-semibold">Mythology & Origins</h3>
        <Button variant="link" className="text-primary hover:text-primary-dark">
          See all
        </Button>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <h4 className="font-spiritual text-xl mb-4">The Story of {festival.name}</h4>
        
        <p className="mb-6 font-body text-neutral-darkest">
          {festival.story || 
            `No detailed story is available for ${festival.name}. Please check back later for updates.`}
        </p>
        
        {/* Audio Player */}
        <div className="bg-neutral-light rounded-lg p-4 flex items-center">
          <Button
            variant="default"
            size="icon"
            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mr-4 hover:bg-primary-dark transition-colors"
            onClick={togglePlayback}
          >
            <span className="material-icons">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </Button>
          
          <div className="flex-1">
            <p className="font-medium mb-1">Listen to Complete Story</p>
            <div className="h-1.5 bg-neutral-DEFAULT rounded-full w-full">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-sm text-neutral-darker">
              <span>
                {Math.floor(progress * 12.45 / 100)
                  .toString()
                  .padStart(2, '0')}
                :{Math.floor((progress * 12.45 / 100 % 1) * 60)
                  .toString()
                  .padStart(2, '0')}
              </span>
              <span>12:45</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
