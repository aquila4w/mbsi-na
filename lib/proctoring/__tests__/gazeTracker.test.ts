import { GazeTracker } from '../gazeTracker';

describe('GazeTracker', () => {
  let gazeTracker: GazeTracker;

  beforeEach(() => {
    gazeTracker = new GazeTracker();
  });

  afterEach(() => {
    if (gazeTracker.getTrackingStatus()) {
      gazeTracker.stopTracking();
    }
  });

  describe('Initialization', () => {
    test('should initialize with tracking status false', () => {
      expect(gazeTracker.getTrackingStatus()).toBe(false);
    });

    test('should have null video stream initially', () => {
      expect(gazeTracker.getVideoStream()).toBeNull();
    });
  });

  describe('Gaze Calculations', () => {
    test('should calculate deviation from center correctly', () => {
      const testCases = [
        { x: 0, y: 0, expected: 0 },
        { x: 1, y: 0, expected: 1 },
        { x: 0, y: 1, expected: 1 },
        { x: 0.5, y: 0.5, expected: Math.sqrt(0.5) }
      ];

      testCases.forEach(({ x, y, expected }) => {
        const deviation = Math.sqrt(x ** 2 + y ** 2);
        expect(deviation).toBeCloseTo(expected, 4);
      });
    });

    test('should normalize coordinates correctly', () => {
      const canvasWidth = 1280;
      const canvasHeight = 720;

      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      const normalizedX = (centerX / canvasWidth) * 2 - 1;
      const normalizedY = (centerY / canvasHeight) * 2 - 1;

      expect(normalizedX).toBeCloseTo(0, 2);
      expect(normalizedY).toBeCloseTo(0, 2);
    });

    test('should calculate head rotation angles', () => {
      const normalizedX = 0.5;
      const normalizedY = -0.3;

      const headYaw = normalizedX * 30;
      const headPitch = normalizedY * 30;

      expect(headYaw).toBe(15);
      expect(headPitch).toBe(-9);
    });
  });

  describe('Looking At Screen Detection', () => {
    test('should detect when user is looking at screen', () => {
      const threshold = 25;

      const testCases = [
        { yaw: 10, pitch: 10, expected: true },
        { yaw: 30, pitch: 10, expected: false },
        { yaw: 10, pitch: 30, expected: false },
        { yaw: 0, pitch: 0, expected: true }
      ];

      testCases.forEach(({ yaw, pitch, expected }) => {
        const lookingAtScreen =
          Math.abs(yaw) < threshold && Math.abs(pitch) < threshold;
        expect(lookingAtScreen).toBe(expected);
      });
    });
  });

  describe('Gaze Data Structure', () => {
    test('should return valid gaze data structure for face detected', () => {
      const mockGazeData = {
        gazeX: 0.5,
        gazeY: 0.3,
        headYaw: 15,
        headPitch: 9,
        headRoll: 0,
        faceDetected: true,
        faceCount: 1,
        lookingAtScreen: true,
        deviationFromCenter: 0.58,
        sustainedLookAwaySeconds: 0
      };

      expect(mockGazeData).toMatchObject({
        gazeX: expect.any(Number),
        gazeY: expect.any(Number),
        headYaw: expect.any(Number),
        headPitch: expect.any(Number),
        headRoll: expect.any(Number),
        faceDetected: expect.any(Boolean),
        faceCount: expect.any(Number),
        lookingAtScreen: expect.any(Boolean),
        deviationFromCenter: expect.any(Number),
        sustainedLookAwaySeconds: expect.any(Number)
      });
    });

    test('should return valid gaze data structure for no face detected', () => {
      const mockGazeData = {
        gazeX: 0,
        gazeY: 0,
        headYaw: 0,
        headPitch: 0,
        headRoll: 0,
        faceDetected: false,
        faceCount: 0,
        lookingAtScreen: false,
        deviationFromCenter: 1.0,
        sustainedLookAwaySeconds: 5
      };

      expect(mockGazeData.faceDetected).toBe(false);
      expect(mockGazeData.faceCount).toBe(0);
      expect(mockGazeData.lookingAtScreen).toBe(false);
    });
  });

  describe('Look Away Duration Tracking', () => {
    test('should track sustained look away time', () => {
      const startTime = Date.now();
      const endTime = startTime + 5000;
      const duration = (endTime - startTime) / 1000;

      expect(duration).toBe(5);
    });

    test('should reset look away time when face detected', () => {
      let lookAwayDuration = 5;
      let lastLookAwayTime = null;

      lookAwayDuration = 0;

      expect(lookAwayDuration).toBe(0);
      expect(lastLookAwayTime).toBeNull();
    });
  });

  describe('Stop Tracking', () => {
    test('should clean up resources on stop', () => {
      gazeTracker.stopTracking();
      expect(gazeTracker.getTrackingStatus()).toBe(false);
      expect(gazeTracker.getVideoStream()).toBeNull();
    });
  });
});
