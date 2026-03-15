import { AudioMonitor, VoiceActivityResult } from './audioMonitor';
import { GazeTracker, GazeData } from './gazeTracker';
import { MonitorDetector, WindowFocusEvent } from './monitorDetector';
import { supabase } from '@/lib/supabase';

export interface ProctoringEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, any>;
  confidence?: number;
}

export class ProctoringManager {
  private audioMonitor: AudioMonitor;
  private gazeTracker: GazeTracker;
  private monitorDetector: MonitorDetector;

  private sessionId: string | null = null;
  private attemptId: string;
  private violations: ProctoringEvent[] = [];
  private riskScore: number = 0;

  private eventListeners: Map<string, Array<(event: any) => void>> = new Map();

  constructor(attemptId: string) {
    this.attemptId = attemptId;
    this.audioMonitor = new AudioMonitor();
    this.gazeTracker = new GazeTracker();
    this.monitorDetector = new MonitorDetector();
  }

  async startProctoring(videoElement: HTMLVideoElement): Promise<void> {
    try {
      const { data: session, error } = await supabase
        .from('proctoring_sessions')
        .insert({
          attempt_id: this.attemptId,
          student_id: (await supabase.auth.getUser()).data.user?.id,
          webcam_enabled: true,
          microphone_enabled: true,
          face_detection_active: true,
          audio_monitoring_active: true,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      this.sessionId = session.id;

      await this.gazeTracker.startTracking(videoElement, (gazeData) => {
        this.handleGazeUpdate(gazeData);
      });

      await this.audioMonitor.startMonitoring((voiceActivity) => {
        this.handleVoiceActivity(voiceActivity);
      });

      this.monitorDetector.startWindowFocusMonitoring((focusEvent) => {
        this.handleWindowFocus(focusEvent);
      });

      this.monitorDetector.onFullscreenChange((isFullscreen) => {
        if (!isFullscreen) {
          this.logViolation({
            type: 'fullscreen_exit',
            severity: 'high',
            description: 'Student exited fullscreen mode',
            confidence: 100
          });
        }
      });

      this.startPeriodicLogging();
    } catch (error) {
      console.error('Failed to start proctoring:', error);
      throw error;
    }
  }

  private handleGazeUpdate(gazeData: GazeData): void {
    this.emit('gazeUpdate', gazeData);

    if (!gazeData.faceDetected) {
      this.logViolation({
        type: 'face_not_detected',
        severity: 'medium',
        description: 'No face detected in webcam',
        metadata: { duration: gazeData.sustainedLookAwaySeconds },
        confidence: 95
      });
    }

    if (gazeData.faceCount > 1) {
      this.logViolation({
        type: 'multiple_faces',
        severity: 'critical',
        description: `Multiple faces detected (${gazeData.faceCount})`,
        metadata: { faceCount: gazeData.faceCount },
        confidence: 90
      });
    }

    if (!gazeData.lookingAtScreen && gazeData.faceDetected) {
      this.logViolation({
        type: 'gaze_deviation',
        severity: 'medium',
        description: 'Student looking away from screen',
        metadata: {
          headYaw: gazeData.headYaw,
          headPitch: gazeData.headPitch,
          deviation: gazeData.deviationFromCenter
        },
        confidence: 80
      });
    }

    if (gazeData.sustainedLookAwaySeconds > 10) {
      this.logViolation({
        type: 'sustained_look_away',
        severity: 'high',
        description: `Student looked away for ${gazeData.sustainedLookAwaySeconds} seconds`,
        metadata: { duration: gazeData.sustainedLookAwaySeconds },
        confidence: 90
      });
    }

    this.logGazeData(gazeData);
  }

  private handleVoiceActivity(voiceActivity: VoiceActivityResult): void {
    this.emit('voiceActivity', voiceActivity);

    if (voiceActivity.isActive && voiceActivity.duration > 3000) {
      this.logViolation({
        type: 'audio_detected',
        severity: 'medium',
        description: 'Voice activity detected during quiz',
        metadata: {
          duration: voiceActivity.duration,
          volume: voiceActivity.volumeLevel
        },
        confidence: 75
      });
    }
  }

  private handleWindowFocus(focusEvent: WindowFocusEvent): void {
    if (focusEvent.type === 'blur') {
      this.logViolation({
        type: 'tab_switch',
        severity: 'high',
        description: 'Student switched tabs or windows',
        metadata: { timestamp: focusEvent.timestamp },
        confidence: 100
      });
    }
  }

  private async logViolation(event: ProctoringEvent): Promise<void> {
    const isDuplicate = this.violations.some(
      v => v.type === event.type && Date.now() - new Date(v.metadata?.timestamp || 0).getTime() < 5000
    );

    if (isDuplicate) return;

    this.violations.push({
      ...event,
      metadata: { ...event.metadata, timestamp: new Date() }
    });

    this.calculateRiskScore();
    this.emit('violation', event);

    if (this.sessionId) {
      await supabase.from('proctoring_events').insert({
        proctoring_session_id: this.sessionId,
        attempt_id: this.attemptId,
        event_type: event.type,
        severity: event.severity,
        description: event.description,
        metadata: event.metadata || {},
        confidence_score: event.confidence,
        occurred_at: new Date().toISOString()
      });
    }
  }

  private async logGazeData(gazeData: GazeData): Promise<void> {
    if (!this.sessionId) return;

    await supabase.from('gaze_tracking_logs').insert({
      proctoring_session_id: this.sessionId,
      attempt_id: this.attemptId,
      gaze_x: gazeData.gazeX,
      gaze_y: gazeData.gazeY,
      head_yaw: gazeData.headYaw,
      head_pitch: gazeData.headPitch,
      head_roll: gazeData.headRoll,
      face_detected: gazeData.faceDetected,
      face_count: gazeData.faceCount,
      looking_at_screen: gazeData.lookingAtScreen,
      deviation_from_center: gazeData.deviationFromCenter,
      sustained_look_away_seconds: gazeData.sustainedLookAwaySeconds,
      timestamp: new Date().toISOString()
    });
  }

  private calculateRiskScore(): void {
    const weights = {
      low: 5,
      medium: 15,
      high: 30,
      critical: 50
    };

    let score = 0;
    this.violations.forEach(v => {
      score += weights[v.severity];
    });

    this.riskScore = Math.min(100, score);

    if (this.sessionId) {
      supabase
        .from('proctoring_sessions')
        .update({
          risk_score: this.riskScore,
          total_violations: this.violations.length,
          flagged_for_review: this.riskScore > 70
        })
        .eq('id', this.sessionId)
        .then();
    }
  }

  private startPeriodicLogging(): void {
    setInterval(() => {
      this.emit('riskScoreUpdate', this.riskScore);
    }, 5000);
  }

  async stopProctoring(): Promise<void> {
    this.gazeTracker.stopTracking();
    this.audioMonitor.stopMonitoring();
    this.monitorDetector.stopWindowFocusMonitoring();

    if (this.sessionId) {
      await supabase
        .from('proctoring_sessions')
        .update({
          ended_at: new Date().toISOString(),
          risk_score: this.riskScore,
          total_violations: this.violations.length
        })
        .eq('id', this.sessionId);
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  getViolations(): ProctoringEvent[] {
    return this.violations;
  }

  getRiskScore(): number {
    return this.riskScore;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}
