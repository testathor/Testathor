import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './core/guards/auth.guard';
import { PhaseBugReportingModule } from './phase-bug-reporting/phase-bug-reporting.module';
import { PhaseModerationModule } from './phase-moderation/phase-moderation.module';
import { PhaseTeamResponseModule } from './phase-team-response/phase-team-response.module';
import { PhaseTesterResponseModule } from './phase-tester-response/phase-tester-response.module';

const routes: Routes = [
  { path: '', loadChildren: () => AuthModule},
  { path: 'phaseBugReporting', loadChildren: () => PhaseBugReportingModule, canLoad: [AuthGuard]},
  { path: 'phaseTeamResponse', loadChildren: () => PhaseTeamResponseModule, canLoad: [AuthGuard]},
  { path: 'phaseTesterResponse', loadChildren: () => PhaseTesterResponseModule, canLoad: [AuthGuard]},
  { path: 'phaseModeration', loadChildren: () => PhaseModerationModule, canLoad: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
