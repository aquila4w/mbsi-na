export interface AudioAnalysisResult {
  transcriptText: string;
  speakerCount: number;
  containsSuspiciousKeywords: boolean;
  flaggedKeywords: string[];
  confidence: number;
  detectedLanguage: string;
}

export interface VoiceActivityResult {
  isActive: boolean;
  duration: number;
  volumeLevel: number;
}

export class AudioMonitor {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private isMonitoring = false;

  private readonly SUSPICIOUS_KEYWORDS = [
    'chatgpt', 'ai', 'google', 'search', 'answer', 'help me',
    'what is', 'how do', 'tell me', 'assistant', 'gemini',
    'claude', 'bard', 'question', 'quiz', 'test'
  ];

  private readonly VOICE_THRESHOLD = 0.02;
  private voiceActivityCallback: ((result: VoiceActivityResult) => void) | null = null;
  private audioChunks: Blob[] = [];
  private recordingStartTime: number = 0;

  async startMonitoring(onVoiceActivity?: (result: VoiceActivityResult) => void): Promise<void> {
    if (this.isMonitoring) return;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      source.connect(this.analyser);

      this.voiceActivityCallback = onVoiceActivity || null;
      this.isMonitoring = true;
      this.recordingStartTime = Date.now();

      this.detectVoiceActivity();

    } catch (error) {
      console.error('Failed to start audio monitoring:', error);
      throw new Error('Microphone access denied or not available');
    }
  }

  private detectVoiceActivity(): void {
    if (!this.analyser || !this.isMonitoring) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkVoice = () => {
      if (!this.isMonitoring || !this.analyser) return;

      this.analyser.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / bufferLength);

      const isActive = rms > this.VOICE_THRESHOLD;
      const duration = isActive ? Date.now() - this.recordingStartTime : 0;

      if (this.voiceActivityCallback) {
        this.voiceActivityCallback({
          isActive,
          duration,
          volumeLevel: rms
        });
      }

      requestAnimationFrame(checkVoice);
    };

    checkVoice();
  }

  async startRecording(): Promise<void> {
    if (!this.mediaStream) {
      throw new Error('Audio monitoring must be started first');
    }

    const mediaRecorder = new MediaRecorder(this.mediaStream);
    this.audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    mediaRecorder.start(1000);
    this.recordingStartTime = Date.now();

    return new Promise((resolve) => {
      mediaRecorder.onstop = () => resolve();
    });
  }

  async analyzeAudio(audioBlob: Blob): Promise<AudioAnalysisResult> {
    try {
      const transcriptText = await this.transcribeAudio(audioBlob);
      const speakerCount = this.detectSpeakerCount(transcriptText);
      const flaggedKeywords = this.detectSuspiciousKeywords(transcriptText);

      return {
        transcriptText,
        speakerCount,
        containsSuspiciousKeywords: flaggedKeywords.length > 0,
        flaggedKeywords,
        confidence: 0.85,
        detectedLanguage: 'en'
      };
    } catch (error) {
      console.error('Audio analysis failed:', error);
      throw error;
    }
  }

  private async transcribeAudio(audioBlob: Blob): Promise<string> {
    return '[Audio transcription would use Web Speech API or external service]';
  }

  private detectSpeakerCount(transcript: string): number {
    return 1;
  }

  private detectSuspiciousKeywords(text: string): string[] {
    const lowerText = text.toLowerCase();
    return this.SUSPICIOUS_KEYWORDS.filter(keyword =>
      lowerText.includes(keyword.toLowerCase())
    );
  }

  async getAudioBlob(): Promise<Blob> {
    if (this.audioChunks.length === 0) {
      throw new Error('No audio recorded');
    }
    return new Blob(this.audioChunks, { type: 'audio/webm' });
  }

  stopMonitoring(): void {
    this.isMonitoring = false;

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.voiceActivityCallback = null;
    this.audioChunks = [];
  }

  getMonitoringStatus(): boolean {
    return this.isMonitoring;
  }
}
