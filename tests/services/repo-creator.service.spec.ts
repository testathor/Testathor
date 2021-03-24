import {
  BUG_REPORTING_INVALID_ROLE,
  CURRENT_PHASE_REPO_CLOSED,
  MISSING_REQUIRED_REPO,
  RepoCreatorService
} from '../../src/app/core/services/repo-creator.service';
import { of } from 'rxjs';
import { UserService } from '../../src/app/core/services/user.service';
import { Phase } from '../../src/app/core/models/phase.model';
import { USER_JUNWEI, USER_Q } from '../constants/data.constants';

const PHASE_OWNER = 'CATcher-org';
const PHASE_REPO = 'bugreporting';
let repoCreatorService: RepoCreatorService;
let githubService: any;
let userService: UserService;

describe('RepoCreatorService', () => {
  beforeEach(() => {
    userService = new UserService(null, null);
    githubService = jasmine.createSpyObj('GithubService', ['isRepositoryPresent', 'createRepository']);
    repoCreatorService = new RepoCreatorService(githubService, userService);
  });

  describe('.verifyRepoCreation()', () => {
    it('should not need to check the presence of the repository if no fix was done', () => {
      of(null).pipe(repoCreatorService.verifyRepoCreation(PHASE_OWNER, PHASE_REPO)).subscribe();

      expect(githubService.isRepositoryPresent).not.toHaveBeenCalled();
    });

    it('should check the presence of the repository if a fix was done', () => {
      githubService.isRepositoryPresent.and.callFake(() => of(true));
      of(true).pipe(repoCreatorService.verifyRepoCreation(PHASE_OWNER, PHASE_REPO)).subscribe();

      expect(githubService.isRepositoryPresent).toHaveBeenCalledWith(PHASE_OWNER, PHASE_REPO);
    });
  });

  describe('verifyRepoCreationPermissions()', () => {
    it('should return the original permissions if repo creation was not needed', () => {
      userService.currentUser = USER_JUNWEI;
      of(null)
        .pipe(repoCreatorService.verifyRepoCreationPermissions(Phase.phaseBugReporting))
        .subscribe((repoCreationPermission: boolean | null) => expect(repoCreationPermission).toBe(null));
    });

    it('should return the original permissions if permissions were given', () => {
      userService.currentUser = USER_JUNWEI;
      of(true)
        .pipe(repoCreatorService.verifyRepoCreationPermissions(Phase.phaseBugReporting))
        .subscribe((repoCreationPermission: boolean | null) => expect(repoCreationPermission).toBe(true));
    });

    it('should throw an error if no permissions were given', () => {
      of(false)
        .pipe(repoCreatorService.verifyRepoCreationPermissions(Phase.phaseBugReporting))
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(MISSING_REQUIRED_REPO))
        });
    });

    it('should throw an error if the wrong phase were given', () => {
      of(true)
        .pipe(repoCreatorService.verifyRepoCreationPermissions(Phase.phaseModeration))
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(CURRENT_PHASE_REPO_CLOSED))
        });
    });

    it('should throw an error if permissions, correct phase, but wrong user role were given', () => {
      userService.currentUser = USER_Q;
      of(true)
        .pipe(repoCreatorService.verifyRepoCreationPermissions(Phase.phaseBugReporting))
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(BUG_REPORTING_INVALID_ROLE))
        });
    });
  });

  describe('.attemptRepoCreation()', () => {
    it('should not create the repository if repo creation is not needed', () => {
      of(null).pipe(repoCreatorService.attemptRepoCreation(PHASE_REPO)).subscribe();

      expect(githubService.createRepository).not.toHaveBeenCalled();
    });

    it('should create the repository if permissions, correct phase and correct user role were given', () => {
      userService.currentUser = USER_JUNWEI;
      githubService.createRepository.and.callFake(() => of(true));
      of(true).pipe(repoCreatorService.attemptRepoCreation(PHASE_REPO)).subscribe();

      expect(githubService.createRepository).toHaveBeenCalledWith(PHASE_REPO);
    });
  });
});
