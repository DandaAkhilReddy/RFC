// Azure Speech Service Integration for ReddyFit

const AZURE_SPEECH_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY || '';
const AZURE_SPEECH_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus';

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  duration: number;
}

// Initialize Azure Speech SDK
let speechRecognizer: any = null;

export async function initializeSpeechRecognizer(): Promise<void> {
  try {
    // Dynamically import Azure Speech SDK
    const sdk = await import('microsoft-cognitiveservices-speech-sdk');

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      AZURE_SPEECH_KEY,
      AZURE_SPEECH_REGION
    );

    speechConfig.speechRecognitionLanguage = 'en-US';
    speechConfig.outputFormat = sdk.OutputFormat.Detailed;

    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

    speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    console.log('Azure Speech Recognizer initialized');
  } catch (error) {
    console.error('Error initializing Speech Recognizer:', error);
    throw error;
  }
}

// Start continuous speech recognition
export async function startContinuousRecognition(
  onRecognizing: (text: string) => void,
  onRecognized: (result: SpeechRecognitionResult) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    if (!speechRecognizer) {
      await initializeSpeechRecognizer();
    }

    // Set up event handlers
    speechRecognizer.recognizing = (s: any, e: any) => {
      if (e.result.text) {
        onRecognizing(e.result.text);
      }
    };

    speechRecognizer.recognized = (s: any, e: any) => {
      const sdk = require('microsoft-cognitiveservices-speech-sdk');

      if (e.result.reason === sdk.ResultReason.RecognizedSpeech && e.result.text) {
        const result: SpeechRecognitionResult = {
          text: e.result.text,
          confidence: e.result.properties.getProperty('CONFIDENCE'),
          duration: e.result.duration / 10000000 // Convert to seconds
        };
        onRecognized(result);
      }
    };

    speechRecognizer.canceled = (s: any, e: any) => {
      console.log(`Speech recognition canceled: ${e.reason}`);
      if (e.errorDetails) {
        onError(`Error: ${e.errorDetails}`);
      }
      speechRecognizer.stopContinuousRecognitionAsync();
    };

    speechRecognizer.sessionStopped = (s: any, e: any) => {
      console.log('Speech recognition session stopped');
      speechRecognizer.stopContinuousRecognitionAsync();
    };

    // Start recognition
    await speechRecognizer.startContinuousRecognitionAsync();

  } catch (error) {
    console.error('Error starting speech recognition:', error);
    onError('Failed to start speech recognition');
    throw error;
  }
}

// Stop continuous speech recognition
export async function stopContinuousRecognition(): Promise<void> {
  try {
    if (speechRecognizer) {
      await speechRecognizer.stopContinuousRecognitionAsync();
      speechRecognizer.close();
      speechRecognizer = null;
    }
  } catch (error) {
    console.error('Error stopping speech recognition:', error);
    throw error;
  }
}

// Simple one-shot speech recognition from audio blob
export async function recognizeSpeechFromBlob(audioBlob: Blob): Promise<string> {
  try {
    const sdk = await import('microsoft-cognitiveservices-speech-sdk');

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      AZURE_SPEECH_KEY,
      AZURE_SPEECH_REGION
    );

    speechConfig.speechRecognitionLanguage = 'en-US';

    // Convert blob to ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioData = new Uint8Array(arrayBuffer);

    // Create push stream
    const pushStream = sdk.AudioInputStream.createPushStream();
    pushStream.write(audioData);
    pushStream.close();

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result: any) => {
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            recognizer.close();
            resolve(result.text);
          } else {
            recognizer.close();
            reject(new Error('Speech not recognized'));
          }
        },
        (error: any) => {
          recognizer.close();
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('Error recognizing speech from blob:', error);
    throw error;
  }
}

// Text-to-Speech (bonus feature)
export async function synthesizeSpeech(
  text: string,
  voiceName: string = 'en-US-JennyNeural'
): Promise<Blob> {
  try {
    const sdk = await import('microsoft-cognitiveservices-speech-sdk');

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      AZURE_SPEECH_KEY,
      AZURE_SPEECH_REGION
    );

    speechConfig.speechSynthesisVoiceName = voiceName;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        (result: any) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const audioBlob = new Blob([result.audioData], { type: 'audio/wav' });
            synthesizer.close();
            resolve(audioBlob);
          } else {
            synthesizer.close();
            reject(new Error('Speech synthesis failed'));
          }
        },
        (error: any) => {
          synthesizer.close();
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw error;
  }
}

// Check microphone availability
export async function checkMicrophoneAvailability(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone not available:', error);
    return false;
  }
}
