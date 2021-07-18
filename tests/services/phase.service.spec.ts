import { of } from 'rxjs';
import { Phase } from '../../src/app/core/models/phase.model';
import { NO_ACCESSIBLE_PHASES } from '../../src/app/core/models/session.model';
import { PhaseService } from '../../src/app/core/services/phase.service';
import {
  BUG_REPORTING_PHASE_SESSION_DATA,
  MODERATION_PHASE_SESSION_DATA,
  MULTIPLE_OPEN_PHASES_SESSION_DATA,
  NO_OPEN_PHASES_SESSION_DATA
} from '../constants/session.constants';

let phaseService: PhaseService;
let githubService: any;

describe('PhaseService', () => {
  beforeEach(() => {
    githubService = jasmine.createSpyObj('GithubService', ['fetchSettingsFile', 'storePhaseDetails']);
    phaseService = new PhaseService(githubService, null, null);
  });

  describe('.storeSessionData()', () => {
    it('should not throw any errors if there is a defined openPhase', () => {
      githubService.fetchSettingsFile.and.returnValue(of(BUG_REPORTING_PHASE_SESSION_DATA));
      phaseService.storeSessionData().subscribe({
        error: () => fail()
      });
    });

    it('should not throw any errors if there are multiple defined openPhases', () => {
      githubService.fetchSettingsFile.and.returnValue(of(MULTIPLE_OPEN_PHASES_SESSION_DATA));
      phaseService.storeSessionData().subscribe({
        error: () => fail()
      });
    });

    it('should throw an error if no openPhases are defined', () => {
      githubService.fetchSettingsFile.and.returnValue(of(NO_OPEN_PHASES_SESSION_DATA));
      phaseService.storeSessionData().subscribe({
        next: () => fail(),
        error: (err) => expect(err).toEqual(new Error(NO_ACCESSIBLE_PHASES))
      });
    });
  });

  describe('.githubRepoPermissionLevel()', () => {
    it('should return "repo" if phaseModeration is included in openPhases', () => {
      phaseService.sessionData = MODERATION_PHASE_SESSION_DATA;
      expect(phaseService.sessionData.openPhases).toContain(Phase.phaseModeration);
      expect(phaseService.githubRepoPermissionLevel()).toEqual('repo');
    });

    it('should return "public_repo" if phaseModeration is not included in openPhases', () => {
      phaseService.sessionData = NO_OPEN_PHASES_SESSION_DATA;
      expect(phaseService.sessionData.openPhases).not.toContain(Phase.phaseModeration);
      expect(phaseService.githubRepoPermissionLevel()).toEqual('public_repo');
    });
  });

  describe('.reset()', () => {
    it('should reset the currentPhase of the PhaseService', () => {
      phaseService.currentPhase = Phase.phaseBugReporting;
      phaseService.reset();
      expect(phaseService.currentPhase).toBeNull();
    });
  });
});
