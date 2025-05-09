import { useQuery } from "@tanstack/react-query";
import { Ritual } from "@shared/schema";
import { useEffect, useState } from "react";
import { synthesizeSpeech, DEFAULT_VOICE_ID } from "@/lib/elevenlabs";

export function useRituals(festivalId?: number) {
  const [currentRitual, setCurrentRitual] = useState<Ritual | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Get rituals for a specific festival
  const { 
    data: festivalRituals, 
    isLoading
  } = useQuery({
    queryKey: festivalId ? [`/api/rituals/festival/${festivalId}`] : [],
    enabled: !!festivalId
  });

  // Set first ritual as current when data loads
  useEffect(() => {
    if (festivalRituals && festivalRituals.length > 0 && !currentRitual) {
      setCurrentRitual(festivalRituals[0]);
    }
  }, [festivalRituals, currentRitual]);

  // Get a specific ritual
  const getRitualById = async (id: number) => {
    if (!id) return null;
    
    try {
      const response = await fetch(`/api/rituals/${id}`, {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch ritual");
      }
      
      const ritual = await response.json();
      return ritual;
    } catch (error) {
      console.error("Error fetching ritual:", error);
      return null;
    }
  };

  // Play text using ElevenLabs
  const playRitualText = async (text: string, voiceId = DEFAULT_VOICE_ID) => {
    setIsPlaying(true);
    
    try {
      const result = await synthesizeSpeech({
        text,
        voiceId
      });
      
      if (result.success && result.audioUrl) {
        setAudioUrl(result.audioUrl);
        const audio = new Audio(result.audioUrl);
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
        });
        audio.play();
      } else {
        throw new Error("Failed to synthesize speech");
      }
    } catch (error) {
      console.error("Error playing ritual text:", error);
      setIsPlaying(false);
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    // Stop any playing audio
    if (audioUrl) {
      const allAudio = document.querySelectorAll('audio');
      allAudio.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
  };

  return {
    festivalRituals,
    isLoading,
    currentRitual,
    setCurrentRitual,
    getRitualById,
    playRitualText,
    stopPlayback,
    isPlaying,
    audioUrl
  };
}
