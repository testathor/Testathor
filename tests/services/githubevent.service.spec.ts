import { of } from 'rxjs';
import { GithubEventService } from '../../src/app/core/services/githubevent.service';
import { ADD_LABEL_EVENT, CHANGE_TITLE_EVENT, EVENTS } from '../constants/githubevent.constants';

let githubService: any;
let issueService: any;

describe('GithubEventService', () => {
  beforeAll(() => {
    githubService = jasmine.createSpyObj('GithubService', ['fetchEventsForRepo']);
    issueService = jasmine.createSpyObj('IssueService', ['reloadAllIssues']);
    issueService.reloadAllIssues.and.returnValue(of([]));
  });

  describe('.setLatestChangeEvent()', () => {
    it('stores the time of the most recent issue event and most recent issue update.', async () => {
      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, issueService);
      await githubEventService.setLatestChangeEvent().toPromise();
      githubEventService.reloadPage().subscribe((result) => expect(result).toBe(false));
    });
  });

  describe('.reloadPage()', () => {
    afterEach(() => {
      issueService.reloadAllIssues.calls.reset();
    });

    it('triggers the IssueService to re-initialise the issue list if there are new events', async () => {
      const FIRST_EVENT = [ADD_LABEL_EVENT];
      const SECOND_EVENT = [CHANGE_TITLE_EVENT];
      githubService.fetchEventsForRepo.and.returnValue(of(FIRST_EVENT));
      const githubEventService: GithubEventService = new GithubEventService(githubService, issueService);
      githubEventService.reloadPage().subscribe((result) => expect(result).toBe(true));

      githubService.fetchEventsForRepo.and.returnValue(of(SECOND_EVENT));
      githubEventService.reloadPage().subscribe((result) => expect(result).toBe(true));
    });

    it('does not trigger the IssueService to re-initialise the issue list, if there are no new events', () => {
      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, issueService);
      githubEventService.reloadPage().subscribe((result) => expect(result).toBe(true));

      // issueService.reloadAllIssues must not have been called again
      githubEventService.reloadPage().subscribe((result) => expect(result).toBe(false));
    });
  });

  describe('.reset()', () => {
    it('clears the details of the most recent event', async () => {
      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, issueService);
      await githubEventService.setLatestChangeEvent().toPromise();
      githubEventService.reset();

      // reloadPage should return an Observable of true due to reset()
      githubEventService.reloadPage().subscribe((result) => expect(result).toBe(true));
    });
  });
});
