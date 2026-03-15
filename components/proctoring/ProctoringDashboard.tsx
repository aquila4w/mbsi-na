'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mic, MicOff, Monitor, User, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Circle as XCircle, Activity, Clock } from 'lucide-react';
import { GazeData } from '@/lib/proctoring/gazeTracker';
import { VoiceActivityResult } from '@/lib/proctoring/audioMonitor';

interface ProctoringDashboardProps {
  gazeData: GazeData | null;
  voiceActivity: VoiceActivityResult | null;
  violations: Array<{
    type: string;
    severity: string;
    timestamp: Date;
    description: string;
  }>;
  riskScore: number;
}

export function ProctoringDashboard({
  gazeData,
  voiceActivity,
  violations,
  riskScore
}: ProctoringDashboardProps) {
  const [recentViolations, setRecentViolations] = useState<typeof violations>([]);

  useEffect(() => {
    setRecentViolations(violations.slice(-5).reverse());
  }, [violations]);

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadge = (score: number) => {
    if (score < 30) return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
    if (score < 70) return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
    return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Face Detection</CardTitle>
          {gazeData?.faceDetected ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              {gazeData?.faceDetected ? (
                <Badge className="bg-green-100 text-green-800">Detected</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">Not Detected</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Face Count:</span>
              <span className="font-semibold">{gazeData?.faceCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Looking at Screen:</span>
              {gazeData?.lookingAtScreen ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Head Position</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Yaw (L/R):</span>
              <span className="font-mono text-sm">{gazeData?.headYaw.toFixed(1)}°</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pitch (U/D):</span>
              <span className="font-mono text-sm">{gazeData?.headPitch.toFixed(1)}°</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deviation:</span>
              <span className="font-mono text-sm">{((gazeData?.deviationFromCenter || 0) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Voice Activity</CardTitle>
          {voiceActivity?.isActive ? (
            <Mic className="h-4 w-4 text-green-600" />
          ) : (
            <MicOff className="h-4 w-4 text-gray-400" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              {voiceActivity?.isActive ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800">Silent</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Volume:</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${((voiceActivity?.volumeLevel || 0) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Duration:</span>
              <span className="font-mono text-sm">{Math.floor((voiceActivity?.duration || 0) / 1000)}s</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-bold ${getRiskColor(riskScore)}`}>
                {riskScore}
              </span>
              {getRiskBadge(riskScore)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  riskScore < 30
                    ? 'bg-green-600'
                    : riskScore < 70
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${riskScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Based on {violations.length} detected violations
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Look Away Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold">
              {gazeData?.sustainedLookAwaySeconds || 0}s
            </div>
            {(gazeData?.sustainedLookAwaySeconds || 0) > 5 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Extended look away detected
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
          <CardDescription>{violations.length} incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{violations.length}</div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Violations</CardTitle>
          <CardDescription>Last 5 detected incidents</CardDescription>
        </CardHeader>
        <CardContent>
          {recentViolations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
              <p>No violations detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentViolations.map((violation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200"
                >
                  <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${
                    violation.severity === 'critical' ? 'text-red-600' :
                    violation.severity === 'high' ? 'text-orange-600' :
                    violation.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm capitalize">
                        {violation.type.replace(/_/g, ' ')}
                      </span>
                      <Badge className={getSeverityColor(violation.severity)}>
                        {violation.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{violation.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(violation.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
