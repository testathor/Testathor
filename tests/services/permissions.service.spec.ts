import { Phase } from '../../src/app/core/models/phase.model';
import { UserRole } from '../../src/app/core/models/user.model';
import { PermissionService } from '../../src/app/core/services/permission.service';
import { PhaseService } from '../../src/app/core/services/phase.service';
import { UserService } from '../../src/app/core/services/user.service';

const testStudent = {
  loginId: 'testStudent',
  role: UserRole.Student
};

const testTutor = {
  loginId: 'testTutor',
  role: UserRole.Tutor
};

const testAdmin = {
  loginId: 'testAdmin',
  role: UserRole.Admin
};

const mockUserService = new UserService(null, null);
const mockPhaseService = new PhaseService(null, null, null);
const permissionService = new PermissionService(mockUserService, mockPhaseService);

describe('Test a few permissions for each role in each phase', () => {
  it('Test a few permissions for UserRole.Student', () => {
    mockPhaseService.currentPhase = Phase.phaseBugReporting;
    mockUserService.currentUser = testStudent;
    expect(permissionService.isIssueCreatable()).toBe(true);
    expect(permissionService.isTutorResponseEditable()).toBe(false);
    mockPhaseService.currentPhase = Phase.phaseTeamResponse;
    expect(permissionService.isIssueLabelsEditable()).toBe(true);
    expect(permissionService.isTeamResponseEditable()).toBe(true);
    mockPhaseService.currentPhase = Phase.phaseTesterResponse;
    expect(permissionService.isIssueEditable()).toBe(true);
    expect(permissionService.isIssueDescriptionEditable()).toBe(false);
    mockPhaseService.currentPhase = Phase.phaseModeration;
    expect(permissionService.isIssueDeletable()).toBe(false);
    expect(permissionService.isIssueTitleEditable()).toBe(false);
  });

  it('Test a few permissions for UserRole.Tutor', () => {
    mockPhaseService.currentPhase = Phase.phaseBugReporting;
    mockUserService.currentUser = testTutor;
    expect(permissionService.isIssueCreatable()).toBe(false);
    expect(permissionService.isIssueTitleEditable()).toBe(false);
    mockPhaseService.currentPhase = Phase.phaseTeamResponse;
    expect(permissionService.isIssueLabelsEditable()).toBe(false);
    expect(permissionService.isTeamResponseEditable()).toBe(false);
    mockPhaseService.currentPhase = Phase.phaseTesterResponse;
    expect(permissionService.isIssueEditable()).toBe(false);
    expect(permissionService.isIssueDescriptionEditable()).toBe(false);
    mockPhaseService.currentPhase = Phase.phaseModeration;
    expect(permissionService.isTutorResponseEditable()).toBe(true);
    expect(permissionService.isIssueDeletable()).toBe(false);
  });

  it('Test a few permissions for UserRole.Admin', () => {
    mockPhaseService.currentPhase = Phase.phaseBugReporting;
    mockUserService.currentUser = testAdmin;
    expect(permissionService.isIssueCreatable()).toBe(true);
    expect(permissionService.isTutorResponseEditable()).toBe(false);
    mockPhaseService.currentPhase = Phase.phaseTeamResponse;
    expect(permissionService.isIssueLabelsEditable()).toBe(true);
    expect(permissionService.isTeamResponseEditable()).toBe(true);
    mockPhaseService.currentPhase = Phase.phaseTesterResponse;
    expect(permissionService.isIssueEditable()).toBe(true);
    expect(permissionService.isIssueDescriptionEditable()).toBe(true);
    mockPhaseService.currentPhase = Phase.phaseModeration;
    expect(permissionService.isIssueDeletable()).toBe(false);
    expect(permissionService.isIssueTitleEditable()).toBe(false);
  });
});
