import { Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AuthService, AuthState } from '../core/services/auth.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorHandlingService } from '../core/services/error-handling.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GithubService } from '../core/services/github.service';
import { PhaseService } from '../core/services/phase.service';
import { Title } from '@angular/platform-browser';
import { Profile } from '../core/models/profile.model';
import { filter, flatMap } from 'rxjs/operators';
import { UserService } from '../core/services/user.service';
import { GithubEventService } from '../core/services/githubevent.service';
import { ElectronService } from '../core/services/electron.service';
import { ApplicationService } from '../core/services/application.service';
import { throwIfFalse } from '../shared/lib/custom-ops';
import { AppConfig } from '../../environments/environment';
import { GithubUser } from '../core/models/github-user.model';
import { LoggingService } from '../core/services/logging.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  // isReady is used to indicate whether the pre-processing of application is done.
  isReady: boolean;
  // isSettingUpSession is used to indicate whether CATcher is in the midst of setting up the session.
  isSettingUpSession: boolean;

  // Errors
  isAppOutdated: boolean;
  versionCheckingError: boolean;

  authState: AuthState;
  accessTokenSubscription: Subscription;
  authStateSubscription: Subscription;
  profileForm: FormGroup;
  currentUserName: string;

  constructor(public appService: ApplicationService,
              public electronService: ElectronService,
              private githubService: GithubService,
              private authService: AuthService,
              private githubEventService: GithubEventService,
              private userService: UserService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              private router: Router,
              private phaseService: PhaseService,
              private titleService: Title,
              private ngZone: NgZone,
              private activatedRoute: ActivatedRoute,
              private logger: LoggingService
  ) {
    this.electronService.registerIpcListener('github-oauth-reply',
      (event, {token, error, isWindowClosed}) => {
      this.ngZone.run(() => {
        if (error) {
          if (!isWindowClosed) {
            this.errorHandlingService.handleError(error);
          }
          this.goToSessionSelect();
          return;
        }
        this.authService.storeOAuthAccessToken(token);
      });
    });
  }

  ngOnInit() {
    this.logger.info('Initialising authentication window');
    this.isReady = false;
    const oauthCode = this.activatedRoute.snapshot.queryParamMap.get('code');
    const state = this.activatedRoute.snapshot.queryParamMap.get('state');

    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.phaseService.currentPhase]);
      return;
    }

    if (oauthCode) { // In the web's oauth window
      this.logger.info('Obtained authorisation code from Github');
      window.opener.postMessage({ oauthCode, state }, AppConfig.origin);
      this.logger.info('Sent authorisation code and state to main application window, waiting to close');
      this.listenForCloseOAuthWindowMessage();
    } else { // In the main app window
      this.checkAppIsOutdated();
      this.initAccessTokenSubscription();
      this.initAuthStateSubscription();
      this.initProfileForm();
    }
  }

  /**
   * A listener for receiving the oauthCode from the oauth window.
   * With the oauth code, we can retrieve the accessToken from the proxy.
   */
  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (event.origin !== AppConfig.origin) {
      return;
    }

    const { oauthCode, state } = event.data;

    if (!oauthCode) {
        return;
    }

    if (!this.authService.isReturnedStateSame(state)) {
      this.logger.info('Received incorrect state, continue waiting for correct state');
      return;
    }

    this.logger.info('Retrieving access token from Github');

    const accessTokenUrl = `${AppConfig.accessTokenUrl}/${oauthCode}/client_id/${AppConfig.clientId}`;
    fetch(accessTokenUrl).then(res => res.json())
      .then(data => {
          if (data.error) {
            throw(new Error(data.error));
          }
          this.authService.storeOAuthAccessToken(data.token);
          this.logger.info('Sucessfully obtained access token');
        }
      )
      .catch(err => {
        this.logger.info(`Error in data fetched from access token URL: ${err}`);
        this.errorHandlingService.handleError(err);
        this.authService.changeAuthState(AuthState.NotAuthenticated);
      })
      .finally(() => {
        if (!(event.source instanceof MessagePort) && !(event.source instanceof ServiceWorker)) {
          event.source.postMessage('close', AppConfig.origin);
          this.logger.info('Closing authentication window');
        }
      });
  }

  ngOnDestroy() {
    this.electronService.removeIpcListeners('github-oauth-reply');
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
    if (this.accessTokenSubscription) {
      this.accessTokenSubscription.unsubscribe();
    }
  }

  /**
   * Checks whether the current version of CATcher is outdated.
   */
  checkAppIsOutdated(): void {
    this.appService.isApplicationOutdated().subscribe((isOutdated: boolean) => {
      this.isAppOutdated = isOutdated;
      this.isReady = true;
      this.versionCheckingError = false;
    }, (error) => {
      this.errorHandlingService.handleError(error);
      this.isReady = true;
      this.versionCheckingError = true;
    });
  }

  /**
   * Fills the login form with data from the given Profile.
   * @param profile - Profile selected by the user.
   */
  onProfileSelect(profile: Profile): void {
    this.profileForm.get('session').setValue(profile.encodedText);
  }

  /**
   * Will complete the process of logging in the given user.
   * @param username - The user to log in.
   */
  completeLoginProcess(username: string): void {
    this.authService.changeAuthState(AuthState.AwaitingAuthentication);
    this.phaseService.setPhaseOwners(this.currentSessionOrg, username);
    this.userService.createUserModel(username).pipe(
      flatMap(() => this.phaseService.sessionSetup()),
      flatMap(() => this.githubEventService.setLatestChangeEvent()),
    ).subscribe(() => {
      this.handleAuthSuccess();
      this.logger.info('Successfully completed login process');
    }, (error) => {
      this.authService.changeAuthState(AuthState.NotAuthenticated);
      this.errorHandlingService.handleError(error);
      this.logger.info(`Completion of login process failed with an error: ${error}`);
    });
  }

  setupSession() {
    if (this.profileForm.invalid) {
      return;
    }
    this.isSettingUpSession = true;
    const sessionInformation: string = this.profileForm.get('session').value;
    const org: string = this.getOrgDetails(sessionInformation);
    const dataRepo: string = this.getDataRepoDetails(sessionInformation);
    this.githubService.storeOrganizationDetails(org, dataRepo);

    this.phaseService.storeSessionData().pipe(
      throwIfFalse(isValidSession => isValidSession,
                   () => new Error('Invalid Session'))
    ).subscribe(() => {
      this.authService.startOAuthProcess();
    }, (error) => {
      this.errorHandlingService.handleError(error);
      this.isSettingUpSession = false;
    }, () => this.isSettingUpSession = false);
  }

  logIntoAnotherAccount() {
    this.logger.info('Logging into another account');
    this.electronService.clearCookies();
    this.authService.startOAuthProcess();
  }

  onGithubWebsiteClicked() {
    window.open('https://github.com/', '_blank');
    window.location.reload();
  }

  /**
   * Handles the clean up required after authentication and setting up of user data is completed.
   */
  handleAuthSuccess() {
    this.authService.setTitleWithPhaseDetail();
    this.router.navigateByUrl(this.phaseService.currentPhase);
    this.authService.changeAuthState(AuthState.Authenticated);
  }

  goToSessionSelect() {
    this.authService.changeAuthState(AuthState.NotAuthenticated);
  }

  isUserNotAuthenticated(): boolean {
    return this.authState === AuthState.NotAuthenticated;
  }

  isUserAuthenticating(): boolean {
    return this.authState === AuthState.AwaitingAuthentication;
  }

  isAwaitingOAuthUserConfirm(): boolean {
    return this.authState === AuthState.ConfirmOAuthUser;
  }

  get currentSessionOrg(): string {
    const sessionInformation: string = this.profileForm.get('session').value;
    return this.getOrgDetails(sessionInformation);
  }

  /**
   * Will wait for the message from parent window to close the window.
   */
  private listenForCloseOAuthWindowMessage() {
    window.addEventListener('message', (event) => {
      if (event.origin !== AppConfig.origin) {
        return;
      }
      if (event.data === 'close') {
        window.opener.focus();
        window.close();
        this.logger.info('Closed authentication window');
      }
    });
  }

  /**
   * Extracts the Organization Details from the input sessionInformation.
   * @param sessionInformation - string in the format of 'orgName/dataRepo'
   */
  private getOrgDetails(sessionInformation: string) {
    return sessionInformation.split('/')[0];
  }

  /**
   * Extracts the Data Repository Details from the input sessionInformation.
   * @param sessionInformation - string in the format of 'orgName/dataRepo'
   */
  private getDataRepoDetails(sessionInformation: string) {
    return sessionInformation.split('/')[1];
  }

  private initProfileForm() {
    this.profileForm = this.formBuilder.group({
      session: ['', Validators.required],
    });
  }

  private initAuthStateSubscription() {
    this.authStateSubscription = this.authService.currentAuthState.subscribe((state) => {
      this.ngZone.run(() => {
        this.authState = state;
      });
    });
  }

  private initAccessTokenSubscription() {
    this.accessTokenSubscription = this.authService.accessToken.pipe(
      filter((token: string) => !!token),
      flatMap(() => this.userService.getAuthenticatedUser())
    ).subscribe((user: GithubUser) => {
      this.ngZone.run(() => {
        this.currentUserName = user.login;
        this.authService.changeAuthState(AuthState.ConfirmOAuthUser);
      });
    });
  }
}
