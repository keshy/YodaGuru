import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Ritual } from "@shared/schema";
import { VOICES, SPIRITUAL_VOICES, synthesizeSpeech } from "@/lib/elevenlabs";
import { useTheme } from "@/components/theme/ThemeProvider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface RitualPlayerProps {
  ritual: Ritual;
  onBack: () => void;
}

export default function RitualPlayer({ ritual, onBack }: RitualPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [selectedVoice, setSelectedVoice] = useState(SPIRITUAL_VOICES[0].id);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { theme } = useTheme();
  
  // Use appropriate voice list based on theme
  const voiceList = theme === 'spiritual' ? SPIRITUAL_VOICES : VOICES;
  
  const steps = ritual?.steps ? JSON.parse(ritual.steps as string) : [];
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
  
  const playStep = async () => {
    if (!steps[currentStep]) return;
    
    setIsPlaying(true);
    
    try {
      const result = await synthesizeSpeech({
        text: steps[currentStep],
        voiceId: selectedVoice
      });
      
      if (result.success && result.audioUrl) {
        setAudioUrl(result.audioUrl);
        
        if (audioRef.current) {
          audioRef.current.src = result.audioUrl;
          audioRef.current.play();
        }
      }
    } catch (error) {
      console.error('Error playing step:', error);
      setIsPlaying(false);
    }
  };
  
  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      pausePlayback();
    }
  };
  
  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      pausePlayback();
    }
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-4" onClick={onBack}>
          <span className="material-icons">arrow_back</span>
        </Button>
        <h2 className="font-heading text-2xl font-semibold">Priest Mode</h2>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-xl font-semibold">{ritual.title}</h3>
            <span className="px-3 py-1 bg-primary-light/10 text-primary rounded-full text-sm font-medium">
              Active
            </span>
          </div>
          
          <p className="mb-6">{ritual.description}</p>
          
          {ritual.materials && ritual.materials.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Materials Required:</h4>
                <Button variant="link" className="text-primary hover:text-primary-dark text-sm">
                  Download PDF
                </Button>
              </div>
              
              <ul className="list-disc list-inside space-y-2 pl-4">
                {ritual.materials.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>
          )}
          
          {steps.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-4">Puja Procedure:</h4>
              <div className="space-y-4 font-spiritual text-lg">
                {steps.map((step: string, index: number) => (
                  <p 
                    key={index}
                    className={`p-3 rounded-lg ${
                      currentStep === index 
                        ? "bg-primary-light/20 border-l-4 border-primary" 
                        : "bg-neutral-light"
                    }`}
                  >
                    {index + 1}. {step}
                  </p>
                ))}
              </div>
            </div>
          )}
          
          {/* Voice Narration Controls */}
          <div className="border-t border-neutral-DEFAULT pt-6">
            <div className="bg-neutral-light rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="material-icons text-primary mr-2">record_voice_over</span>
                  <span className="font-medium">Voice Narration</span>
                </div>
                <div className="flex items-center">
                  <Select
                    value={selectedVoice}
                    onValueChange={setSelectedVoice}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceList.map(voice => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center ml-4 w-32">
                    <span className="material-icons text-neutral-darker">volume_up</span>
                    <Slider
                      value={[volume]}
                      max={100}
                      step={1}
                      className="mx-2"
                      onValueChange={(vals) => setVolume(vals[0])}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={previousStep}
                  disabled={currentStep === 0}
                  className="text-neutral-darker hover:text-neutral-darkest disabled:opacity-50"
                >
                  <span className="material-icons">skip_previous</span>
                </Button>
                
                <Button
                  className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors"
                  onClick={isPlaying ? pausePlayback : playStep}
                >
                  <span className="material-icons">
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                  className="text-neutral-darker hover:text-neutral-darkest disabled:opacity-50"
                >
                  <span className="material-icons">skip_next</span>
                </Button>
              </div>
              
              <div className="mt-4 flex items-center justify-center text-neutral-darker">
                Step {currentStep + 1} of {steps.length}
              </div>
              
              {/* Hidden audio element for playback */}
              <audio 
                ref={audioRef}
                src={audioUrl || ""}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              ></audio>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
