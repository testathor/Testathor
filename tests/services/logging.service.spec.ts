import { LoggingService } from '../../src/app/core/services/logging.service';
import { MockLocalStorage } from '../helper/mock.local.storage';

let loggingService: LoggingService;
let headerLog: string;
let sessionSeparator: string;
const mockDate = new Date(2021, 6, 27);
const infoLogMessage = 'Info log message';

const testAddLog = (message: string) => {
  loggingService.startSession();
  const initialLog = loggingService.getCachedLog();
  loggingService.info(message);
  const actualLog = loggingService.getCachedLog();
  const expectedLog = `${initialLog}\n${message}`;
  expect(actualLog).toEqual(expectedLog);
};

describe('LoggingService', () => {
  beforeAll(() => {
    // Initialize mock local storage
    const mockLocalStorage = new MockLocalStorage();

    // Mock function calls
    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem.bind(mockLocalStorage));
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem.bind(mockLocalStorage));
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem.bind(mockLocalStorage));
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear.bind(mockLocalStorage));

    // Mock dates
    jasmine.clock().install();
    jasmine.clock().mockDate(mockDate);

    // Initialize logging service
    const electronService = jasmine.createSpyObj('ElectronService', ['isElectron']);
    electronService.isElectron = jasmine.createSpy('isElectron', () => false);
    loggingService = new LoggingService(electronService);
    headerLog = `${loggingService.LOG_START_HEADER}\n${mockDate.toLocaleString()}`;
    sessionSeparator = loggingService.SESSION_LOG_SEPARATOR;
  });

  beforeEach(() => {
    loggingService.reset();
    localStorage.clear();
  });

  afterAll(() => {
    jasmine.clock().uninstall();
  });

  describe('.startSession()', () => {
    it('should successfully initialize logging session', () => {
      loggingService.startSession();
      const actualLog = loggingService.getCachedLog();
      const expectedLog = headerLog;
      expect(actualLog).toEqual(expectedLog);
    });

    it('should successfully reinitialize logging session', () => {
      loggingService.startSession();
      loggingService.reset();
      loggingService.startSession();
      const actualLog = loggingService.getCachedLog();
      const expectedLog = `${headerLog}${sessionSeparator}${headerLog}`;
      expect(actualLog).toEqual(expectedLog);
    });

    it('should successfully reinitialize logging session when limit reached', () => {
      Array(loggingService.LOG_COUNT_LIMIT)
        .fill(0)
        .forEach(() => {
          loggingService.startSession();
          loggingService.reset();
        });
      loggingService.startSession();
      const actualLog = loggingService.getCachedLog();
      const expectedLog = Array(loggingService.LOG_COUNT_LIMIT)
        .fill('')
        .map((_) => headerLog)
        .join(sessionSeparator);
      expect(actualLog).toEqual(expectedLog);
    });
  });

  describe('.reset()', () => {
    it('should do nothing if no session is ongoing', () => {
      loggingService.reset();
      const actualLog = loggingService.getCachedLog();
      expect(actualLog).toBeNull();
    });

    it('should not tamper with existing log histories', () => {
      let expectedLog = headerLog;
      for (let i = 0; i < loggingService.LOG_COUNT_LIMIT + 1; i += 1) {
        loggingService.startSession();
        loggingService.reset();
        const actualLog = loggingService.getCachedLog();
        expect(actualLog).toEqual(expectedLog);
        if (i < loggingService.LOG_COUNT_LIMIT - 1) {
          expectedLog += `${sessionSeparator}${headerLog}`;
        }
      }
    });
  });

  describe('adding logs', () => {
    it('should successfully add info logs', () => {
      testAddLog(infoLogMessage);
    });
  });

  describe('updating and trimming logs from sessions', () => {
    it('should trim oldest log if number of sessions exceed session limit', () => {
      Array(loggingService.LOG_COUNT_LIMIT + 1)
        .fill(0)
        .forEach(() => {
          loggingService.startSession();
          loggingService.info(infoLogMessage);
          loggingService.reset();
        });
      loggingService.startSession();
      const actualLog = loggingService.getCachedLog();
      const expectedLog = Array(loggingService.LOG_COUNT_LIMIT)
        .fill('')
        .map((_) => headerLog)
        .join(`\n${infoLogMessage}${sessionSeparator}`);
      expect(actualLog).toEqual(expectedLog);
    });
  });
});
