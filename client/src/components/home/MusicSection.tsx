import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Bhajan } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import PlaylistPlayer from "@/components/audio/PlaylistPlayer";

interface MusicSectionProps {
  festivalId?: number;
}

export default function MusicSection({ festivalId }: MusicSectionProps) {
  const [selectedBhajan, setSelectedBhajan] = useState<Bhajan | null>(null);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  
  const { data: bhajans, isLoading } = useQuery<Bhajan[]>({
    queryKey: festivalId ? [`/api/bhajans/festival/${festivalId}`] : [],
    enabled: !!festivalId
  });
  
  const openYouTube = (url: string) => {
    window.open(url, '_blank');
  };
  
  const handlePlaySingle = (bhajan: Bhajan) => {
    setSelectedBhajan(bhajan);
    setIsPlaylistOpen(true);
  };
  
  const handlePlayAll = () => {
    setSelectedBhajan(null);
    setIsPlaylistOpen(true);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-xl font-semibold">Bhajans & Devotional Music</h3>
        <div className="flex items-center">
          {bhajans && bhajans.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2 flex items-center"
              onClick={handlePlayAll}
            >
              <span className="material-icons text-sm mr-1">queue_music</span>
              Play All
            </Button>
          )}
          <Button variant="link" className="text-primary hover:text-primary-dark">
            Browse All
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="w-full h-48 bg-neutral-light"></div>
              <CardContent className="p-4">
                <div className="h-5 w-36 bg-neutral-light rounded mb-2"></div>
                <div className="h-4 w-24 bg-neutral-light rounded mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-6 w-6 bg-neutral-light rounded-full"></div>
                    <div className="h-6 w-6 bg-neutral-light rounded-full ml-4"></div>
                  </div>
                  <div className="h-4 w-20 bg-neutral-light rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !bhajans || bhajans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <span className="material-icons text-neutral-dark text-4xl mb-2">music_note</span>
          <h4 className="font-medium mb-2">No Bhajans Available</h4>
          <p className="text-neutral-darker">
            No devotional music is currently available for this festival.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bhajans.map((bhajan: Bhajan) => (
              <Card key={bhajan.id} className="overflow-hidden">
                <div className="w-full h-48 bg-neutral-light flex items-center justify-center relative group">
                  <span className="material-icons text-5xl text-neutral-dark">music_note</span>
                  <div className="absolute inset-0 bg-primary-dark/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="default" 
                      size="icon" 
                      className="bg-white/90 hover:bg-white text-primary rounded-full w-12 h-12 shadow-lg"
                      onClick={() => handlePlaySingle(bhajan)}
                    >
                      <span className="material-icons text-2xl">play_arrow</span>
                    </Button>
                  </div>
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
                        onClick={() => handlePlaySingle(bhajan)}
                      >
                        <span className="material-icons">play_circle</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 text-neutral-darker hover:text-neutral-darkest"
                        onClick={handlePlayAll}
                      >
                        <span className="material-icons">playlist_add</span>
                      </Button>
                    </div>
                    <Button
                      variant="link"
                      className="text-sm text-primary hover:text-primary-dark flex items-center"
                      onClick={() => openYouTube(bhajan.youtubeUrl)}
                    >
                      YouTube <span className="material-icons text-sm ml-1">open_in_new</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Playlist Dialog */}
          <Dialog open={isPlaylistOpen} onOpenChange={setIsPlaylistOpen}>
            <DialogContent className="sm:max-w-3xl">
              <PlaylistPlayer 
                bhajans={selectedBhajan ? [selectedBhajan] : (bhajans || [])} 
                onClose={() => setIsPlaylistOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
