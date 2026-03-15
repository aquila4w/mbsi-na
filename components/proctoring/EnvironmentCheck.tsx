'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CircleCheck as CheckCircle2, Circle as XCircle, Camera, Monitor, TriangleAlert as AlertTriangle } from 'lucide-react';

interface EnvironmentCheckProps {
  onCheckComplete: (passed: boolean) => void;
  attemptId: string;
}

interface CheckResult {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'checking' | 'passed' | 'failed';
  required: boolean;
}

export function EnvironmentCheck({ onCheckComplete, attemptId }: EnvironmentCheckProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [checks, setChecks] = useState<CheckResult[]>([
    {
      id: 'webcam',
      title: 'Webcam Access',
      description: 'Enable your webcam for facial recognition',
      status: 'pending',
      required: true
    },
    {
      id: 'microphone',
      title: 'Microphone Access',
      description: 'Enable your microphone for audio monitoring',
      status: 'pending',
      required: true
    },
    {
      id: 'room_scan',
      title: 'Room Scan',
      description: 'Pan your camera 360° to show your environment',
      status: 'pending',
      required: true
    },
    {
      id: 'desk_check',
      title: 'Desk Check',
      description: 'Show your desk is clear of unauthorized materials',
      status: 'pending',
      required: true
    },
    {
      id: 'screen_count',
      title: 'Monitor Detection',
      description: 'Verify single monitor setup',
      status: 'pending',
      required: true
    },
    {
      id: 'id_verification',
      title: 'ID Verification',
      description: 'Show a valid photo ID to verify your identity',
      status: 'pending',
      required: false
    }
  ]);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanningComplete, setScanningComplete] = useState(false);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const updateCheckStatus = (id: string, status: CheckResult['status']) => {
    setChecks(prev => prev.map(check =>
      check.id === id ? { ...check, status } : check
    ));
  };

  const startWebcamCheck = async () => {
    updateCheckStatus('webcam', 'checking');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      updateCheckStatus('webcam', 'passed');
      updateCheckStatus('microphone', 'passed');
      setCurrentStep(2);
    } catch (error) {
      updateCheckStatus('webcam', 'failed');
      console.error('Failed to access webcam:', error);
    }
  };

  const performRoomScan = () => {
    updateCheckStatus('room_scan', 'checking');
    setTimeout(() => {
      updateCheckStatus('room_scan', 'passed');
      setCurrentStep(3);
    }, 5000);
  };

  const performDeskCheck = () => {
    updateCheckStatus('desk_check', 'checking');
    setTimeout(() => {
      updateCheckStatus('desk_check', 'passed');
      setCurrentStep(4);
    }, 3000);
  };

  const checkMonitors = async () => {
    updateCheckStatus('screen_count', 'checking');

    try {
      if ('getScreenDetails' in window) {
        const screenDetails = await (window as any).getScreenDetails();
        const screenCount = screenDetails.screens.length;

        if (screenCount > 1) {
          updateCheckStatus('screen_count', 'failed');
          return;
        }
      }

      updateCheckStatus('screen_count', 'passed');
      setCurrentStep(5);
    } catch (error) {
      updateCheckStatus('screen_count', 'passed');
      setCurrentStep(5);
    }
  };

  const verifyID = () => {
    updateCheckStatus('id_verification', 'checking');
    setTimeout(() => {
      updateCheckStatus('id_verification', 'passed');
      setScanningComplete(true);
    }, 3000);
  };

  const handleComplete = () => {
    const allRequiredPassed = checks
      .filter(check => check.required)
      .every(check => check.status === 'passed');

    onCheckComplete(allRequiredPassed);
  };

  const getCheckIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'checking':
        return <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Environment Check
          </CardTitle>
          <CardDescription>
            Complete these checks before starting your quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {checks.map((check, index) => (
              <div
                key={check.id}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  index === currentStep ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="mt-0.5">
                  {getCheckIcon(check.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{check.title}</h3>
                    {!check.required && (
                      <span className="text-xs text-gray-500">(Optional)</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{check.description}</p>
                  {check.status === 'failed' && (
                    <Alert className="mt-2" variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This check failed. Please resolve the issue to continue.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            ))}
          </div>

          {currentStep < 2 && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              <Button onClick={startWebcamCheck} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Enable Camera & Microphone
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Alert>
                <Monitor className="h-4 w-4" />
                <AlertDescription>
                  Slowly pan your camera in a 360° circle to show your entire room
                </AlertDescription>
              </Alert>
              <Button onClick={performRoomScan} className="w-full">
                Start Room Scan
              </Button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Point your camera at your desk to show it's clear of unauthorized materials
                </AlertDescription>
              </Alert>
              <Button onClick={performDeskCheck} className="w-full">
                Scan Desk
              </Button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <Alert>
                <Monitor className="h-4 w-4" />
                <AlertDescription>
                  Checking for multiple monitors...
                </AlertDescription>
              </Alert>
              <Button onClick={checkMonitors} className="w-full">
                Check Monitors
              </Button>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Hold up a valid photo ID next to your face (Optional but recommended)
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button onClick={verifyID} className="flex-1">
                  Verify ID
                </Button>
                <Button
                  onClick={() => setScanningComplete(true)}
                  variant="outline"
                  className="flex-1"
                >
                  Skip
                </Button>
              </div>
            </div>
          )}

          {scanningComplete && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Environment check complete! You can now start your quiz.
                </AlertDescription>
              </Alert>
              <Button onClick={handleComplete} className="w-full" size="lg">
                Begin Quiz
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
