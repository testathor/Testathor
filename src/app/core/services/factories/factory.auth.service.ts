import { NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../environments/environment';
import { AuthService } from '../auth.service';
import { DataService } from '../data.service';
import { ElectronService } from '../electron.service';
import { GithubService } from '../github.service';
import { GithubEventService } from '../githubevent.service';
import { IssueService } from '../issue.service';
import { LoggingService } from '../logging.service';
import { MockAuthService } from '../mocks/mock.auth.service';
import { PhaseService } from '../phase.service';
import { UserService } from '../user.service';

export function AuthServiceFactory(electronService: ElectronService, router: Router, ngZone: NgZone,
                                   githubService: GithubService,
                                   userService: UserService,
                                   issueService: IssueService,
                                   phaseService: PhaseService,
                                   dataService: DataService,
                                   githubEventService: GithubEventService,
                                   titleService: Title,
                                   logger: LoggingService) {
  if (AppConfig.test) {
      return new MockAuthService(router, ngZone, githubService,
        userService, issueService, phaseService, dataService,
        githubEventService, titleService, logger);
  }
  console.log(logger);
  return new AuthService(electronService, router, ngZone,
    githubService, userService, issueService, phaseService,
    dataService, githubEventService, titleService, logger);
}
