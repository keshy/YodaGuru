import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Bhajan } from "@shared/schema";

interface PlaylistPlayerProps {
  bhajans: Bhajan[];
  onClose?: () => void;
}

export default function PlaylistPlayer({ bhajans, onClose }: PlaylistPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = bhajans[currentTrackIndex];

  useEffect(() => {
    // Set volume whenever it changes
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    // Reset playback when track changes
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex]);

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleEnded = () => {
    if (currentTrackIndex < bhajans.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < bhajans.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading text-xl font-semibold">{currentTrack?.title || "No track selected"}</h3>
            <p className="text-neutral-darker text-sm">{currentTrack?.type || ""}</p>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <span className="material-icons">close</span>
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Playlist */}
          <div className="bg-neutral-light dark:bg-gray-700 rounded-lg p-4 max-h-48 overflow-y-auto">
            <h4 className="font-medium text-sm mb-2">Playlist</h4>
            <ul className="space-y-2">
              {bhajans.map((bhajan, index) => (
                <li 
                  key={bhajan.id} 
                  className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-neutral-DEFAULT dark:hover:bg-gray-600 ${
                    index === currentTrackIndex ? "bg-primary-light/20 dark:bg-primary-dark/30" : ""
                  }`}
                  onClick={() => setCurrentTrackIndex(index)}
                >
                  <span className="material-icons text-sm mr-2">
                    {index === currentTrackIndex && isPlaying ? "pause_circle" : "play_circle"}
                  </span>
                  <div className="flex-1 truncate">
                    <span className="font-medium">{bhajan.title}</span>
                    <span className="text-xs text-neutral-darker ml-2">{bhajan.duration || "Unknown"}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Playback Controls */}
          <div>
            <div className="flex items-center mb-2">
              <span className="text-xs text-neutral-darker w-10">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={0.1}
                className="mx-2 flex-1"
                onValueChange={handleSeek}
              />
              <span className="text-xs text-neutral-darker w-10">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                disabled={currentTrackIndex === 0}
                className="text-neutral-darker hover:text-neutral-darkest disabled:opacity-50"
              >
                <span className="material-icons">skip_previous</span>
              </Button>
              
              <Button
                className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors"
                onClick={handlePlay}
              >
                <span className="material-icons">
                  {isPlaying ? "pause" : "play_arrow"}
                </span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={currentTrackIndex === bhajans.length - 1}
                className="text-neutral-darker hover:text-neutral-darkest disabled:opacity-50"
              >
                <span className="material-icons">skip_next</span>
              </Button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center">
            <span className="material-icons text-neutral-darker mr-2">
              {volume === 0 ? "volume_off" : volume < 50 ? "volume_down" : "volume_up"}
            </span>
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              className="w-32"
              onValueChange={(value) => setVolume(value[0])}
            />
          </div>
        </div>

        {/* Audio Element */}
        <audio 
          ref={audioRef}
          src={currentTrack?.youtubeUrl || ""}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}