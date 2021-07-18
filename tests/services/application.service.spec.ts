import { of } from 'rxjs';
import { ApplicationService } from '../../src/app/core/services/application.service';
import { GithubService } from '../../src/app/core/services/github.service';

const currentVersion = '3.2.5';

class ApplicationServiceStub extends ApplicationService {
  readonly currentVersion: string;
  constructor(githubService: GithubService, currentVersion: string) {
    super(githubService);
    this.currentVersion = currentVersion;
  }
}

describe('ApplicationService#isApplicationOutdated', () => {
  const githubService = jasmine.createSpyObj('GithubService', ['fetchLatestRelease']);
  it('should return the appropriate Observable if the ApplicationService is outdated', () => {
    githubService.fetchLatestRelease.and.returnValue(of({ tag_name: 'v2.2.5' }));
    const outdatedAppService1 = new ApplicationServiceStub(githubService, currentVersion);
    outdatedAppService1.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(false));

    githubService.fetchLatestRelease.and.returnValue(of({ tag_name: 'v3.1' }));
    const outdatedAppService2 = new ApplicationServiceStub(githubService, currentVersion);
    outdatedAppService2.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(false));

    githubService.fetchLatestRelease.and.returnValue(of({ tag_name: 'v3.2.4' }));
    const outdatedAppService3 = new ApplicationServiceStub(githubService, currentVersion);
    outdatedAppService3.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(false));

    githubService.fetchLatestRelease.and.returnValue(of({ tag_name: 'v3.2.4.8.9' }));
    const longVersionedAppService = new ApplicationServiceStub(githubService, currentVersion);
    longVersionedAppService.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(false));

    githubService.fetchLatestRelease.and.returnValue(of({ tag_name: 'v3.2.5' }));
    const latestApplicationService = new ApplicationServiceStub(githubService, currentVersion);
    latestApplicationService.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(false));

    githubService.fetchLatestRelease.and.returnValue(of({ tag_name: 'v3.2.5.0' }));
    const upToDateAppService1 = new ApplicationServiceStub(githubService, currentVersion);
    upToDateAppService1.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(true));

    githubService.fetchLatestRelease.and.returnValue(of({ tag_name: 'v3.2.5.5' }));
    const upToDateAppService2 = new ApplicationServiceStub(githubService, currentVersion);
    upToDateAppService2.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(true));

    githubService.fetchLatestRelease.and.returnValue(of({ tag_name: 'v3.2.6' }));
    const upToDateAppService3 = new ApplicationServiceStub(githubService, currentVersion);
    upToDateAppService3.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(true));

    githubService.fetchLatestRelease.and.returnValue(of({ tag_name: 'v10' }));
    const upToDateAppService4 = new ApplicationServiceStub(githubService, currentVersion);
    upToDateAppService4.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(true));
  });
});
