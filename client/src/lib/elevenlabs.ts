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
    const response = await fetch('/api/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice_id: voiceId,
        stability,
        similarity_boost: similarityBoost,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Speech synthesis failed');
    }

    const data = await response.json();
    
    // In a real implementation, this would be a blob URL to the audio
    // For now, we'll use a placeholder response
    return {
      success: true,
      audioUrl: data.audio_url || 'https://example.com/audio.mp3',
    };
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
