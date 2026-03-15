export interface MonitorInfo {
  screenCount: number;
  screens: Array<{
    width: number;
    height: number;
    isPrimary: boolean;
    left: number;
    top: number;
  }>;
  hasMultipleMonitors: boolean;
}

export interface WindowFocusEvent {
  type: 'blur' | 'focus';
  timestamp: number;
  duration?: number;
}

export class MonitorDetector {
  private focusListeners: Array<(event: WindowFocusEvent) => void> = [];
  private lastBlurTime: number | null = null;
  private isMonitoring = false;

  async detectMonitors(): Promise<MonitorInfo> {
    try {
      if ('getScreenDetails' in window) {
        const screenDetails = await (window as any).getScreenDetails();
        const screens = screenDetails.screens.map((screen: any) => ({
          width: screen.width,
          height: screen.height,
          isPrimary: screen.isPrimary,
          left: screen.left,
          top: screen.top
        }));

        return {
          screenCount: screens.length,
          screens,
          hasMultipleMonitors: screens.length > 1
        };
      }

      const fallbackInfo = this.getFallbackMonitorInfo();
      return fallbackInfo;
    } catch (error) {
      console.warn('Screen Details API not available, using fallback detection');
      return this.getFallbackMonitorInfo();
    }
  }

  private getFallbackMonitorInfo(): MonitorInfo {
    const width = window.screen.width;
    const height = window.screen.height;
    const availWidth = window.screen.availWidth;
    const availHeight = window.screen.availHeight;

    const hasExtendedDisplay =
      availWidth > width ||
      availHeight > height ||
      window.screenX < 0 ||
      window.screenX > width;

    return {
      screenCount: hasExtendedDisplay ? 2 : 1,
      screens: [{
        width,
        height,
        isPrimary: true,
        left: 0,
        top: 0
      }],
      hasMultipleMonitors: hasExtendedDisplay
    };
  }

  startWindowFocusMonitoring(onFocusChange: (event: WindowFocusEvent) => void): void {
    if (this.isMonitoring) return;

    this.focusListeners.push(onFocusChange);

    const handleBlur = () => {
      this.lastBlurTime = Date.now();
      onFocusChange({
        type: 'blur',
        timestamp: this.lastBlurTime
      });
    };

    const handleFocus = () => {
      const focusTime = Date.now();
      const duration = this.lastBlurTime ? focusTime - this.lastBlurTime : 0;

      onFocusChange({
        type: 'focus',
        timestamp: focusTime,
        duration
      });

      this.lastBlurTime = null;
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    this.isMonitoring = true;
  }

  stopWindowFocusMonitoring(): void {
    window.removeEventListener('blur', () => {});
    window.removeEventListener('focus', () => {});
    this.focusListeners = [];
    this.isMonitoring = false;
    this.lastBlurTime = null;
  }

  async detectFullscreenExit(): Promise<boolean> {
    return !document.fullscreenElement;
  }

  async requestFullscreen(): Promise<void> {
    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      throw new Error('Fullscreen mode is required for this quiz');
    }
  }

  isFullscreen(): boolean {
    return !!document.fullscreenElement;
  }

  onFullscreenChange(callback: (isFullscreen: boolean) => void): void {
    const handler = () => callback(this.isFullscreen());
    document.addEventListener('fullscreenchange', handler);
  }
}
