'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnvironmentCheck } from './EnvironmentCheck';
import { ProctoringDashboard } from './ProctoringDashboard';
import { ProctoringManager } from '@/lib/proctoring/proctoringManager';
import { GazeData } from '@/lib/proctoring/gazeTracker';
import { VoiceActivityResult } from '@/lib/proctoring/audioMonitor';
import { TriangleAlert as AlertTriangle, Eye, Shield } from 'lucide-react';

interface ProctoreddQuizProps {
  attemptId: string;
  quizId: string;
  children: React.ReactNode;
  onViolationLimitExceeded?: () => void;
}

export function ProctoreddQuiz({
  attemptId,
  quizId,
  children,
  onViolationLimitExceeded
}: ProctoreddQuizProps) {
  const [environmentCheckComplete, setEnvironmentCheckComplete] = useState(false);
  const [proctoringActive, setProctoringActive] = useState(false);
  const [gazeData, setGazeData] = useState<GazeData | null>(null);
  const [voiceActivity, setVoiceActivity] = useState<VoiceActivityResult | null>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [riskScore, setRiskScore] = useState(0);
  const [showDashboard, setShowDashboard] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const proctoringManagerRef = useRef<ProctoringManager | null>(null);

  useEffect(() => {
    if (environmentCheckComplete && !proctoringActive && videoRef.current) {
      startProctoring();
    }

    return () => {
      if (proctoringManagerRef.current) {
        proctoringManagerRef.current.stopProctoring();
      }
    };
  }, [environmentCheckComplete]);

  const startProctoring = async () => {
    if (!videoRef.current) return;

    try {
      const manager = new ProctoringManager(attemptId);
      proctoringManagerRef.current = manager;

      manager.on('gazeUpdate', (data: GazeData) => {
        setGazeData(data);
      });

      manager.on('voiceActivity', (data: VoiceActivityResult) => {
        setVoiceActivity(data);
      });

      manager.on('violation', (violation: any) => {
        setViolations(prev => [...prev, { ...violation, timestamp: new Date() }]);
      });

      manager.on('riskScoreUpdate', (score: number) => {
        setRiskScore(score);
        if (score > 90 && onViolationLimitExceeded) {
          onViolationLimitExceeded();
        }
      });

      await manager.startProctoring(videoRef.current);
      setProctoringActive(true);
    } catch (error) {
      console.error('Failed to start proctoring:', error);
    }
  };

  if (!environmentCheckComplete) {
    return (
      <EnvironmentCheck
        attemptId={attemptId}
        onCheckComplete={(passed) => {
          if (passed) {
            setEnvironmentCheckComplete(true);
          } else {
            alert('Environment check failed. Please resolve the issues and try again.');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Proctored Quiz</span>
            {proctoringActive && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">Monitoring Active</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDashboard(!showDashboard)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showDashboard ? 'Hide' : 'Show'} Monitor
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Risk:</span>
              <span className={`font-semibold ${
                riskScore < 30 ? 'text-green-600' :
                riskScore < 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {riskScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-6">
        {riskScore > 70 && (
          <div className="max-w-7xl mx-auto px-4 mb-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                High risk score detected. Your quiz attempt is being flagged for review.
                Multiple violations may result in automatic submission.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 grid gap-6 lg:grid-cols-3">
          <div className={showDashboard ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <Card>
              <CardContent className="pt-6">
                {children}
              </CardContent>
            </Card>
          </div>

          {showDashboard && (
            <div className="lg:col-span-1 space-y-4">
              <div className="sticky top-24">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg border-2 border-gray-300 mb-4"
                />

                <ProctoringDashboard
                  gazeData={gazeData}
                  voiceActivity={voiceActivity}
                  violations={violations}
                  riskScore={riskScore}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
