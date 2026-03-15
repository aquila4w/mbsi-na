'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AudioMonitor } from '@/lib/proctoring/audioMonitor';
import { GazeTracker } from '@/lib/proctoring/gazeTracker';
import { MonitorDetector } from '@/lib/proctoring/monitorDetector';
import { Mic, Eye, Monitor, CircleCheck as CheckCircle, Circle as XCircle, Activity } from 'lucide-react';

export default function TestProctoringPage() {
  const [audioStatus, setAudioStatus] = useState<string>('Not started');
  const [gazeStatus, setGazeStatus] = useState<string>('Not started');
  const [monitorInfo, setMonitorInfo] = useState<string>('Not checked');
  const [voiceActivity, setVoiceActivity] = useState<any>(null);
  const [gazeData, setGazeData] = useState<any>(null);
  const [testResults, setTestResults] = useState<Array<{ test: string; status: 'pass' | 'fail' | 'pending'; message: string }>>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioMonitorRef = useRef<AudioMonitor | null>(null);
  const gazeTrackerRef = useRef<GazeTracker | null>(null);
  const monitorDetectorRef = useRef<MonitorDetector | null>(null);

  useEffect(() => {
    return () => {
      if (audioMonitorRef.current) {
        audioMonitorRef.current.stopMonitoring();
      }
      if (gazeTrackerRef.current) {
        gazeTrackerRef.current.stopTracking();
      }
      if (monitorDetectorRef.current) {
        monitorDetectorRef.current.stopWindowFocusMonitoring();
      }
    };
  }, []);

  const addTestResult = (test: string, status: 'pass' | 'fail', message: string) => {
    setTestResults(prev => [...prev, { test, status, message }]);
  };

  const testAudioMonitor = async () => {
    try {
      setAudioStatus('Testing...');
      const monitor = new AudioMonitor();
      audioMonitorRef.current = monitor;

      await monitor.startMonitoring((activity) => {
        setVoiceActivity(activity);
      });

      setAudioStatus('Active - Monitoring voice activity');
      addTestResult('Audio Monitor', 'pass', 'Successfully started audio monitoring');

      setTimeout(() => {
        const isMonitoring = monitor.getMonitoringStatus();
        if (isMonitoring) {
          addTestResult('Audio Status Check', 'pass', 'Audio monitoring is active');
        } else {
          addTestResult('Audio Status Check', 'fail', 'Audio monitoring stopped unexpectedly');
        }
      }, 1000);

    } catch (error: any) {
      setAudioStatus(`Failed: ${error.message}`);
      addTestResult('Audio Monitor', 'fail', error.message);
    }
  };

  const testGazeTracker = async () => {
    if (!videoRef.current) {
      addTestResult('Gaze Tracker', 'fail', 'Video element not found');
      return;
    }

    try {
      setGazeStatus('Testing...');
      const tracker = new GazeTracker();
      gazeTrackerRef.current = tracker;

      await tracker.startTracking(videoRef.current, (data) => {
        setGazeData(data);
      });

      setGazeStatus('Active - Tracking gaze and head position');
      addTestResult('Gaze Tracker', 'pass', 'Successfully started gaze tracking');

      setTimeout(() => {
        const isTracking = tracker.getTrackingStatus();
        if (isTracking) {
          addTestResult('Gaze Status Check', 'pass', 'Gaze tracking is active');
        } else {
          addTestResult('Gaze Status Check', 'fail', 'Gaze tracking stopped unexpectedly');
        }
      }, 1000);

    } catch (error: any) {
      setGazeStatus(`Failed: ${error.message}`);
      addTestResult('Gaze Tracker', 'fail', error.message);
    }
  };

  const testMonitorDetector = async () => {
    try {
      const detector = new MonitorDetector();
      monitorDetectorRef.current = detector;

      const info = await detector.detectMonitors();
      setMonitorInfo(`Detected ${info.screenCount} monitor(s)`);

      if (info.hasMultipleMonitors) {
        addTestResult('Monitor Detection', 'pass', `Detected ${info.screenCount} monitors correctly`);
      } else {
        addTestResult('Monitor Detection', 'pass', `Single monitor detected`);
      }

      detector.startWindowFocusMonitoring((event) => {
        if (event.type === 'blur') {
          addTestResult('Window Focus Detection', 'pass', 'Window blur detected successfully');
        } else if (event.type === 'focus') {
          addTestResult('Window Focus Detection', 'pass', `Window focus detected (was away for ${event.duration}ms)`);
        }
      });

      const isFullscreen = detector.isFullscreen();
      addTestResult('Fullscreen Check', 'pass', `Fullscreen status: ${isFullscreen ? 'Yes' : 'No'}`);

    } catch (error: any) {
      setMonitorInfo(`Failed: ${error.message}`);
      addTestResult('Monitor Detection', 'fail', error.message);
    }
  };

  const testKeywordDetection = () => {
    const monitor = audioMonitorRef.current;
    if (!monitor) {
      addTestResult('Keyword Detection', 'fail', 'Audio monitor not started');
      return;
    }

    const testTranscript = 'Can you help me with ChatGPT and Google search for this answer?';
    const keywords = ['chatgpt', 'google', 'search', 'answer'];

    const lowerText = testTranscript.toLowerCase();
    const flaggedKeywords = keywords.filter(keyword => lowerText.includes(keyword));

    if (flaggedKeywords.length > 0) {
      addTestResult('Keyword Detection', 'pass', `Detected suspicious keywords: ${flaggedKeywords.join(', ')}`);
    } else {
      addTestResult('Keyword Detection', 'fail', 'Failed to detect known suspicious keywords');
    }
  };

  const stopAllMonitoring = () => {
    if (audioMonitorRef.current) {
      audioMonitorRef.current.stopMonitoring();
      setAudioStatus('Stopped');
    }
    if (gazeTrackerRef.current) {
      gazeTrackerRef.current.stopTracking();
      setGazeStatus('Stopped');
    }
    if (monitorDetectorRef.current) {
      monitorDetectorRef.current.stopWindowFocusMonitoring();
    }
    addTestResult('Stop All', 'pass', 'All monitoring stopped successfully');
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testAudioMonitor();
    await testGazeTracker();
    await testMonitorDetector();
    setTimeout(() => testKeywordDetection(), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Proctoring System Test Suite</CardTitle>
            <CardDescription>
              Test all proctoring modules to ensure they work correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Button onClick={runAllTests}>
                Run All Tests
              </Button>
              <Button onClick={stopAllMonitoring} variant="destructive">
                Stop All Monitoring
              </Button>
            </div>

            <Tabs defaultValue="audio">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="audio">Audio Monitor</TabsTrigger>
                <TabsTrigger value="gaze">Gaze Tracker</TabsTrigger>
                <TabsTrigger value="monitor">Monitor Detector</TabsTrigger>
                <TabsTrigger value="results">Test Results</TabsTrigger>
              </TabsList>

              <TabsContent value="audio" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      Audio Monitor Test
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Status:</span>
                      <Badge>{audioStatus}</Badge>
                    </div>
                    <Button onClick={testAudioMonitor} className="w-full">
                      Start Audio Monitoring
                    </Button>

                    {voiceActivity && (
                      <div className="p-4 bg-gray-100 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span>Voice Active:</span>
                          <span className="font-semibold">
                            {voiceActivity.isActive ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volume Level:</span>
                          <span className="font-semibold">
                            {(voiceActivity.volumeLevel * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-semibold">
                            {Math.floor(voiceActivity.duration / 1000)}s
                          </span>
                        </div>
                      </div>
                    )}

                    <Alert>
                      <Activity className="h-4 w-4" />
                      <AlertDescription>
                        Speak into your microphone to test voice activity detection
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gaze" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Gaze Tracker Test
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Status:</span>
                      <Badge>{gazeStatus}</Badge>
                    </div>

                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <Button onClick={testGazeTracker} className="w-full">
                      Start Gaze Tracking
                    </Button>

                    {gazeData && (
                      <div className="p-4 bg-gray-100 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span>Face Detected:</span>
                          <span className="font-semibold">
                            {gazeData.faceDetected ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Face Count:</span>
                          <span className="font-semibold">{gazeData.faceCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Looking at Screen:</span>
                          <span className="font-semibold">
                            {gazeData.lookingAtScreen ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Head Yaw (L/R):</span>
                          <span className="font-semibold">{gazeData.headYaw.toFixed(1)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Head Pitch (U/D):</span>
                          <span className="font-semibold">{gazeData.headPitch.toFixed(1)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Look Away Time:</span>
                          <span className="font-semibold">
                            {gazeData.sustainedLookAwaySeconds}s
                          </span>
                        </div>
                      </div>
                    )}

                    <Alert>
                      <Activity className="h-4 w-4" />
                      <AlertDescription>
                        Move your head around to test gaze and head position tracking
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monitor" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Monitor Detector Test
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Detection Result:</span>
                      <Badge>{monitorInfo}</Badge>
                    </div>

                    <Button onClick={testMonitorDetector} className="w-full">
                      Detect Monitors
                    </Button>

                    <Alert>
                      <Activity className="h-4 w-4" />
                      <AlertDescription>
                        Try switching to another window or tab to test window focus detection
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Test Results</CardTitle>
                    <CardDescription>
                      {testResults.length} tests run
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {testResults.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-2" />
                        <p>No tests run yet. Click "Run All Tests" to begin.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {testResults.map((result, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200"
                          >
                            {result.status === 'pass' ? (
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <div className="font-semibold">{result.test}</div>
                              <p className="text-sm text-gray-600">{result.message}</p>
                            </div>
                            <Badge className={
                              result.status === 'pass'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }>
                              {result.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
