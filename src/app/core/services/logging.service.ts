import { Injectable } from '@angular/core';
import { ElectronLog } from 'electron-log';
import { AppConfig } from '../../../environments/environment';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logger: ElectronLog | Console;
  private isInSession = false;
  private readonly LOG_KEY = 'CATcher-Log';
  private readonly LOG_FILE_NAME = 'CATcher-log.txt';
  public readonly LOG_START_HEADER = `====== New CATcher v${AppConfig.version} Session Log ======`;
  public readonly LOG_COUNT_LIMIT = 4;

  constructor(electronService: ElectronService) {
    if (electronService.isElectron()) {
      this.logger = window.require('electron-log');
    } else {
      this.logger = console;
    }

    this.startSession();
  }

  reset() {
    this.isInSession = false;
  }

  /**
   * Configures loggging Session if Logging Service is not
   * in session.
   */
  startSession() {
    // Prevents the OAuth Pop-up window from being able to
    // start a session.
    if (window.opener && window.opener !== window) {
      return;
    }
    if (!this.isInSession) {
      this.isInSession = true;
      this.initializeLogCache();
    }
  }

  initializeLogCache() {
    this.setCachedLog(this.getTrimmedLogCache(this.getCachedLog(), this.LOG_COUNT_LIMIT));
  }

  /**
   * Trims the existing Log in the browser's cache to a select number
   * of Sessions if necessary.
   * @param sessionCount The number of Session Logs to preserve in the cache
   */
  getTrimmedLogCache(currentLog: string, sessionCount: number): string {
    const sessionLogSeparator: string = '\n'.repeat(2); // More new-lines added for clarity.
    const currentDateTime = new Date().toLocaleString();
    const logHeaderWithDateTime = `${this.LOG_START_HEADER}\n${currentDateTime}`;

    // Check if Trimming is Necessary
    const numberOfSessions: number = currentLog == null ? 0 : currentLog.split('\n')
      .filter((currentLogLine: string) => currentLogLine.includes(this.LOG_START_HEADER))
      .length;

    if (numberOfSessions === 0) {
      return logHeaderWithDateTime;
    }

    if (numberOfSessions < sessionCount) {
      return `${currentLog}${sessionLogSeparator}${logHeaderWithDateTime}`;
    }

    const separatedSessionLogs: string[] = currentLog.split(`${this.LOG_START_HEADER}`)
      .filter((line: string) => !!line)
      .map((line: string) => `${this.LOG_START_HEADER}\n${line.trim()}`);

    separatedSessionLogs.splice(0, separatedSessionLogs.length - sessionCount + 1);
    separatedSessionLogs.push(`${logHeaderWithDateTime}`);

    return separatedSessionLogs.join(sessionLogSeparator);
  }

  getCachedLog(): string {
    return localStorage.getItem(this.LOG_KEY);
  }

  setCachedLog(updatedLog: string): void {
    localStorage.setItem(this.LOG_KEY, updatedLog);
  }

  updateLog(... updatedLog: any[]): void {
    this.setCachedLog(`${this.getCachedLog()}\n${updatedLog.toString()}`);
  }

  exportLogFile() {
    const log: string = this.getCachedLog();
    const blob: Blob = new Blob([log], {type: 'file/txt'});
    const blobUrl: string = window.URL.createObjectURL(blob);

    const hiddenElement: HTMLAnchorElement = document.createElement('a');
    hiddenElement.setAttribute('style', 'display: none;');
    hiddenElement.href = blobUrl;
    hiddenElement.download = this.LOG_FILE_NAME;

    // Add to DOM and Click to prompt download.
    document.body.appendChild(hiddenElement);
    hiddenElement.click();

    // Remove URL + Created Attached Element
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(hiddenElement);
    hiddenElement.remove();
  }

  info(...params: any[]) {
    this.updateLog(params);
    this.logger.info(params);
  }

  error(...params: any[]) {
    this.updateLog(params);
    this.logger.error(params);
  }

  warn(...params: any[]) {
    this.updateLog(params);
    this.logger.warn(params);
  }

  debug(...params: any[]) {
    this.updateLog(params);
    this.logger.debug(params);
  }
}
