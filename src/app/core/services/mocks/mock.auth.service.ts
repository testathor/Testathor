import { Injectable } from '@angular/core';
import { NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { uuid } from '../../../shared/lib/uuid';
import { DataService } from '../data.service';
import { GithubService } from '../github.service';
import { GithubEventService } from '../githubevent.service';
import { IssueService } from '../issue.service';
import { LoggingService } from '../logging.service';
import { PhaseService } from '../phase.service';
import { UserService } from '../user.service';

export enum AuthState { 'NotAuthenticated', 'AwaitingAuthentication', 'ConfirmOAuthUser', 'Authenticated'}

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  authStateSource = new BehaviorSubject(AuthState.NotAuthenticated);
  currentAuthState = this.authStateSource.asObservable();
  accessToken = new BehaviorSubject(undefined);

  constructor(private router: Router, private ngZone: NgZone,
              private githubService: GithubService,
              private userService: UserService,
              private issueService: IssueService,
              private phaseService: PhaseService,
              private dataService: DataService,
              private githubEventService: GithubEventService,
              private titleService: Title,
              private logger: LoggingService) {}

  /**
   * Will store the OAuth token.
   */
  storeOAuthAccessToken(token: string) {
    this.githubService.storeOAuthAccessToken(token);
    this.accessToken.next(token);
  }

  reset(): void {
    this.accessToken.next(undefined);
    this.changeAuthState(AuthState.NotAuthenticated);
    this.ngZone.run(() => this.router.navigate(['']));
  }

  logOut(): void {
    this.githubService.reset();
    this.userService.reset();
    this.issueService.reset(true);
    this.phaseService.reset();
    this.dataService.reset();
    this.githubEventService.reset();
    this.logger.reset();
    this.setLandingPageTitle();
    this.issueService.setIssueTeamFilter('All Teams');
    this.reset();
  }

  isAuthenticated(): boolean {
    return this.authStateSource.getValue() === AuthState.Authenticated;
  }

  changeAuthState(newAuthState: AuthState) {
    if (newAuthState === AuthState.Authenticated) {
      const sessionId = `${Date.now()}-${uuid()}`;
      this.issueService.setSessionId(sessionId);
      this.logger.info(`Successfully authenticated with session: ${sessionId}`);
    }
    this.authStateSource.next(newAuthState);
  }

  setTitleWithPhaseDetail(): void {
    const appSetting = require('../../../../../package.json');
    const title = `${appSetting.name} ${appSetting.version} - ${this.phaseService.getPhaseDetail()}`;
    this.titleService.setTitle(title);
  }

  setLandingPageTitle(): void {
    const appSetting = require('../../../../../package.json');
    const title = `${appSetting.name} ${appSetting.version}`;
    this.titleService.setTitle(title);
  }

  /**
   * Will start the Github OAuth web flow process by issuing 'FabricatedToken'.
   */
  startOAuthProcess() {
    this.accessToken.next('FabricatedToken');
  }
}
