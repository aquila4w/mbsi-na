export interface GazeData {
  gazeX: number;
  gazeY: number;
  headYaw: number;
  headPitch: number;
  headRoll: number;
  faceDetected: boolean;
  faceCount: number;
  lookingAtScreen: boolean;
  deviationFromCenter: number;
  sustainedLookAwaySeconds: number;
}

export interface FaceDetectionResult {
  faces: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
  landmarks?: Array<{
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    nose: { x: number; y: number };
    mouth: { x: number; y: number };
  }>;
}

export class GazeTracker {
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private mediaStream: MediaStream | null = null;
  private isTracking = false;
  private gazeCallback: ((data: GazeData) => void) | null = null;

  private lastLookAwayTime: number | null = null;
  private lookAwayDuration = 0;

  private readonly GAZE_THRESHOLD = 0.3;
  private readonly HEAD_ROTATION_THRESHOLD = 25;

  async startTracking(
    videoElement: HTMLVideoElement,
    onGazeUpdate?: (data: GazeData) => void
  ): Promise<void> {
    if (this.isTracking) return;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      this.videoElement = videoElement;
      this.videoElement.srcObject = this.mediaStream;
      await this.videoElement.play();

      this.canvas = document.createElement('canvas');
      this.canvas.width = this.videoElement.videoWidth || 1280;
      this.canvas.height = this.videoElement.videoHeight || 720;
      this.ctx = this.canvas.getContext('2d');

      this.gazeCallback = onGazeUpdate || null;
      this.isTracking = true;

      this.trackGaze();
    } catch (error) {
      console.error('Failed to start gaze tracking:', error);
      throw new Error('Webcam access denied or not available');
    }
  }

  private async trackGaze(): Promise<void> {
    if (!this.isTracking || !this.videoElement || !this.ctx || !this.canvas) return;

    const analyzeFrame = async () => {
      if (!this.isTracking || !this.videoElement || !this.ctx || !this.canvas) return;

      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

      const faceDetection = await this.detectFaces();
      const gazeData = this.calculateGazeData(faceDetection);

      if (this.gazeCallback) {
        this.gazeCallback(gazeData);
      }

      requestAnimationFrame(analyzeFrame);
    };

    analyzeFrame();
  }

  private async detectFaces(): Promise<FaceDetectionResult> {
    return {
      faces: [],
      landmarks: []
    };
  }

  private calculateGazeData(faceDetection: FaceDetectionResult): GazeData {
    const faceCount = faceDetection.faces.length;
    const faceDetected = faceCount > 0;

    if (!faceDetected || faceCount === 0) {
      if (this.lastLookAwayTime === null) {
        this.lastLookAwayTime = Date.now();
      }
      this.lookAwayDuration = (Date.now() - this.lastLookAwayTime) / 1000;

      return {
        gazeX: 0,
        gazeY: 0,
        headYaw: 0,
        headPitch: 0,
        headRoll: 0,
        faceDetected: false,
        faceCount: 0,
        lookingAtScreen: false,
        deviationFromCenter: 1.0,
        sustainedLookAwaySeconds: Math.floor(this.lookAwayDuration)
      };
    }

    this.lastLookAwayTime = null;
    this.lookAwayDuration = 0;

    const face = faceDetection.faces[0];
    const centerX = face.x + face.width / 2;
    const centerY = face.y + face.height / 2;

    const canvasWidth = this.canvas?.width || 1280;
    const canvasHeight = this.canvas?.height || 720;

    const normalizedX = (centerX / canvasWidth) * 2 - 1;
    const normalizedY = (centerY / canvasHeight) * 2 - 1;

    const headYaw = normalizedX * 30;
    const headPitch = normalizedY * 30;
    const headRoll = 0;

    const deviationFromCenter = Math.sqrt(normalizedX ** 2 + normalizedY ** 2);
    const lookingAtScreen =
      Math.abs(headYaw) < this.HEAD_ROTATION_THRESHOLD &&
      Math.abs(headPitch) < this.HEAD_ROTATION_THRESHOLD;

    return {
      gazeX: parseFloat(normalizedX.toFixed(4)),
      gazeY: parseFloat(normalizedY.toFixed(4)),
      headYaw: parseFloat(headYaw.toFixed(4)),
      headPitch: parseFloat(headPitch.toFixed(4)),
      headRoll: parseFloat(headRoll.toFixed(4)),
      faceDetected: true,
      faceCount,
      lookingAtScreen,
      deviationFromCenter: parseFloat(deviationFromCenter.toFixed(4)),
      sustainedLookAwaySeconds: 0
    };
  }

  async captureSnapshot(): Promise<Blob> {
    if (!this.canvas) {
      throw new Error('Tracking not started');
    }

    return new Promise((resolve, reject) => {
      this.canvas!.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to capture snapshot'));
        }
      }, 'image/jpeg', 0.9);
    });
  }

  stopTracking(): void {
    this.isTracking = false;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    this.canvas = null;
    this.ctx = null;
    this.gazeCallback = null;
    this.lastLookAwayTime = null;
    this.lookAwayDuration = 0;
  }

  getTrackingStatus(): boolean {
    return this.isTracking;
  }

  getVideoStream(): MediaStream | null {
    return this.mediaStream;
  }
}
