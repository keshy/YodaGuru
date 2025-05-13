// ElevenLabs API integration for voice synthesis

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

// Voice options based on ElevenLabs premium voices
export const VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel - Warm Female", accent: "American" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi - Soft Male", accent: "American" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella - Soft Female", accent: "American" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni - Gentle Male", accent: "American" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli - Gentle Female", accent: "American" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh - Deep Male", accent: "American" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold - Deep Male", accent: "American" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam - Calm Male", accent: "American" },
];

// Additional spiritual voices - these use the same voice IDs but with different names
// to help users select appropriate voices for spiritual content
export const SPIRITUAL_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Spiritual Guide (Female)", accent: "American" },
  { id: "ErXwobaYiN019PkySvjV", name: "Meditation Guide (Male)", accent: "American" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Ritual Voice (Female)", accent: "American" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Priest Voice (Male)", accent: "American" },
];

// Default voice ID
export const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

interface SynthesizeOptions {
  text: string;
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
}

interface SynthesizeResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

export const synthesizeSpeech = async ({
  text,
  voiceId = DEFAULT_VOICE_ID,
  stability = 0.5,
  similarityBoost = 0.75,
}: SynthesizeOptions): Promise<SynthesizeResponse> => {
  try {
    // Check if we have cached audio for this text+voice combination
    const cacheKey = `elevenlabs_${voiceId}_${text.substring(0, 50)}`;
    const cachedAudio = sessionStorage.getItem(cacheKey);
    
    if (cachedAudio) {
      console.log('Using cached audio for', text.substring(0, 20) + '...');
      return {
        success: true,
        audioUrl: cachedAudio
      };
    }
    
    const response = await fetch('/api/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceId, // Note: Now using camelCase to match server API
        stability,
        similarityBoost,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Speech synthesis failed');
    }

    const data = await response.json();
    
    if (data.success && data.audioUrl) {
      // Cache the audio data for future use to reduce API calls
      try {
        sessionStorage.setItem(cacheKey, data.audioUrl);
      } catch (e) {
        console.warn('Failed to cache audio data:', e);
      }
      
      return {
        success: true,
        audioUrl: data.audioUrl,
      };
    }
    
    return {
      success: false,
      error: 'No audio URL received from server'
    };
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
