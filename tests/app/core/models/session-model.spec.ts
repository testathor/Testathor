import { of } from 'rxjs';
import {
  assertSessionDataIntegrity,
  NO_ACCESSIBLE_PHASES,
  NO_VALID_OPEN_PHASES,
  OPENED_PHASE_REPO_UNDEFINED,
  SESSION_DATA_MISSING_OPENPHASES_KEY,
  SESSION_DATA_UNAVAILABLE
} from '../../../../src/app/core/models/session.model';
import { BUG_REPORTING_PHASE_SESSION_DATA, NO_OPEN_PHASES_SESSION_DATA } from '../../../constants/session.constants';

describe('Session Model', () => {
  describe('assertSessionDataIntegrity()', () => {
    it('should throw error on unavailable session', () => {
      of(undefined)
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(SESSION_DATA_UNAVAILABLE))
        });
    });

    it('should throw error on session data with missing crucial values', () => {
      of({ dummyKey: undefined })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(SESSION_DATA_MISSING_OPENPHASES_KEY))
        });
    });

    it('should throw error on session with no open phases', () => {
      of(NO_OPEN_PHASES_SESSION_DATA)
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(NO_ACCESSIBLE_PHASES))
        });
    });

    it('should throw error on session data with invalid open phases', () => {
      of({ ...BUG_REPORTING_PHASE_SESSION_DATA, openPhases: ['unknownPhase'] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(NO_VALID_OPEN_PHASES))
        });
    });

    it('should throw error on session data with undefined repo for open phase', () => {
      of({ ...BUG_REPORTING_PHASE_SESSION_DATA, phaseBugReporting: undefined })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_PHASE_REPO_UNDEFINED))
        });
      of({ ...BUG_REPORTING_PHASE_SESSION_DATA, phaseBugReporting: null })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_PHASE_REPO_UNDEFINED))
        });
      of({ ...BUG_REPORTING_PHASE_SESSION_DATA, phaseBugReporting: '' })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_PHASE_REPO_UNDEFINED))
        });
    });

    it('should not throw error if session data contains repo information of unopened phases', () => {
      of(BUG_REPORTING_PHASE_SESSION_DATA)
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: (el) => expect(el).toEqual(BUG_REPORTING_PHASE_SESSION_DATA),
          error: () => fail()
        });
    });

    it('should pass valid session data', () => {
      of(BUG_REPORTING_PHASE_SESSION_DATA)
        .pipe(assertSessionDataIntegrity())
        .subscribe((el) => expect(el).toEqual(BUG_REPORTING_PHASE_SESSION_DATA));
    });
  });
});
