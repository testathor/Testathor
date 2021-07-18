import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule, NgZone } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import 'reflect-metadata';
import graphqlTypes from '../../graphql/graphql-types';
import '../polyfills';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { UserConfirmationComponent } from './core/guards/user-confirmation/user-confirmation.component';
import { AuthService } from './core/services/auth.service';
import { DataService } from './core/services/data.service';
import { ElectronService } from './core/services/electron.service';
import { ErrorHandlingService } from './core/services/error-handling.service';
import { AuthServiceFactory } from './core/services/factories/factory.auth.service';
import { GithubServiceFactory } from './core/services/factories/factory.github.service';
import { IssueServiceFactory } from './core/services/factories/factory.issue.service';
import { GithubService } from './core/services/github.service';
import { GithubEventService } from './core/services/githubevent.service';
import { IssueService } from './core/services/issue.service';
import { LoggingService } from './core/services/logging.service';
import { PhaseService } from './core/services/phase.service';
import { SessionFixConfirmationComponent } from './core/services/session-fix-confirmation/session-fix-confirmation.component';
import { UserService } from './core/services/user.service';
import { PhaseBugReportingModule } from './phase-bug-reporting/phase-bug-reporting.module';
import { PhaseModerationModule } from './phase-moderation/phase-moderation.module';
import { PhaseTeamResponseModule } from './phase-team-response/phase-team-response.module';
import { PhaseTesterResponseModule } from './phase-tester-response/phase-tester-response.module';
import { HeaderComponent } from './shared/layout';
import { markedOptionsFactory } from './shared/lib/marked';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    UserConfirmationComponent,
    SessionFixConfirmationComponent
  ],
  imports: [
    BrowserModule,
    PhaseTesterResponseModule,
    BrowserAnimationsModule,
    AuthModule,
    PhaseBugReportingModule,
    PhaseTeamResponseModule,
    PhaseModerationModule,
    SharedModule,
    HttpClientModule,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory
      },
    }),
    AppRoutingModule,
    ApolloModule,
    HttpLinkModule,
  ],
  providers: [
    {
      provide: GithubService,
      useFactory: GithubServiceFactory,
      deps: [ErrorHandlingService, Apollo, ElectronService]
    },
    {
      provide: AuthService,
      useFactory: AuthServiceFactory,
      deps: [ElectronService, Router, NgZone,
      GithubService, UserService, IssueService,
      PhaseService, DataService, GithubEventService,
      Title, LoggingService]
    },
    {
      provide: IssueService,
      useFactory: IssueServiceFactory,
      deps: [GithubService, UserService, PhaseService,
      ElectronService, DataService]
    },
    {
      provide: ErrorHandler,
      useClass: ErrorHandlingService
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    UserConfirmationComponent,
    SessionFixConfirmationComponent
  ]
})

export class AppModule {
  constructor(private apollo: Apollo, private httpLink: HttpLink, private authService: AuthService) {

    const URI = 'https://api.github.com/graphql';
    const basic = setContext(() => {
      return { headers: {Accept: 'charset=utf-8' }};
    });
    const auth = setContext(() => {
      return { headers: { Authorization: `Token ${this.authService.accessToken.getValue()}` } };
    });
    const link = ApolloLink.from([basic, auth, this.httpLink.create({ uri: URI })]);
    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData: graphqlTypes
    });
    const cache = new InMemoryCache({ fragmentMatcher });
    this.apollo.create({
      link: link,
      cache: cache,
    });
  }
}
