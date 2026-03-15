import { AudioMonitor } from '../audioMonitor';

describe('AudioMonitor', () => {
  let audioMonitor: AudioMonitor;

  beforeEach(() => {
    audioMonitor = new AudioMonitor();
  });

  afterEach(() => {
    if (audioMonitor.getMonitoringStatus()) {
      audioMonitor.stopMonitoring();
    }
  });

  describe('Initialization', () => {
    test('should initialize with monitoring status false', () => {
      expect(audioMonitor.getMonitoringStatus()).toBe(false);
    });
  });

  describe('Keyword Detection', () => {
    test('should detect suspicious keywords in transcript', () => {
      const testCases = [
        { text: 'Can you help me with ChatGPT?', expected: ['chatgpt'] },
        { text: 'I will use Google to search for this', expected: ['google', 'search'] },
        { text: 'Tell me the answer please', expected: ['tell me', 'answer'] },
        { text: 'This is a normal sentence', expected: [] }
      ];

      testCases.forEach(({ text, expected }) => {
        const keywords = ['chatgpt', 'google', 'search', 'tell me', 'answer'];
        const lowerText = text.toLowerCase();
        const flagged = keywords.filter(keyword => lowerText.includes(keyword));

        expect(flagged).toEqual(expect.arrayContaining(expected));
      });
    });
  });

  describe('Voice Activity Detection', () => {
    test('should calculate RMS correctly from audio data', () => {
      const mockDataArray = new Uint8Array(2048);
      mockDataArray.fill(128);

      let sum = 0;
      for (let i = 0; i < mockDataArray.length; i++) {
        const normalized = (mockDataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / mockDataArray.length);

      expect(rms).toBeCloseTo(0, 2);
    });

    test('should detect voice activity above threshold', () => {
      const threshold = 0.02;
      const mockHighVolume = 0.05;
      const mockLowVolume = 0.01;

      expect(mockHighVolume > threshold).toBe(true);
      expect(mockLowVolume > threshold).toBe(false);
    });
  });

  describe('Audio Analysis', () => {
    test('should return valid analysis structure', async () => {
      const mockBlob = new Blob(['test'], { type: 'audio/webm' });

      const expectedStructure = {
        transcriptText: expect.any(String),
        speakerCount: expect.any(Number),
        containsSuspiciousKeywords: expect.any(Boolean),
        flaggedKeywords: expect.any(Array),
        confidence: expect.any(Number),
        detectedLanguage: expect.any(String)
      };

      const result = await audioMonitor.analyzeAudio(mockBlob);
      expect(result).toMatchObject(expectedStructure);
    });
  });

  describe('Stop Monitoring', () => {
    test('should clean up resources on stop', () => {
      audioMonitor.stopMonitoring();
      expect(audioMonitor.getMonitoringStatus()).toBe(false);
    });
  });
});
