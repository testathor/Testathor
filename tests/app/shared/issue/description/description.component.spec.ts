import { FormBuilder, NgForm } from '@angular/forms';
import { of } from 'rxjs';
import { Issue } from '../../../../../src/app/core/models/issue.model';
import { Phase } from '../../../../../src/app/core/models/phase.model';
import { PhaseService } from '../../../../../src/app/core/services/phase.service';
import { DescriptionComponent } from '../../../../../src/app/shared/issue/description/description.component';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../../constants/githubissue.constants';

describe('DescriptionComponent', () => {
  let descriptionComponent: DescriptionComponent;
  let issueService: any;
  let phaseService: PhaseService;
  let formBuilder: FormBuilder;
  let thisIssue: Issue;
  let dialog: any;
  let errorHandlingService: any;

  beforeEach(() => {
    formBuilder = new FormBuilder();
    phaseService = new PhaseService(null, null, null);
    phaseService.currentPhase = Phase.phaseTeamResponse;

    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    errorHandlingService = jasmine.createSpyObj('ErrorHandlingService', ['handleError']);
    issueService = jasmine.createSpyObj('IssueService', ['getLatestIssue', 'updateIssue']);

    descriptionComponent = new DescriptionComponent(issueService, formBuilder, errorHandlingService, dialog, phaseService, null);
    thisIssue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    descriptionComponent.issue = thisIssue;
  });

  it('should be initialised with a FromGroup instance', () => {
    descriptionComponent.ngOnInit();
    expect(descriptionComponent.issueDescriptionForm.value).toEqual({ description: '' });
  });

  it('should update the form value correctly and emit an event when entering edit mode', () => {
    const descriptionComponentEditState = spyOn(descriptionComponent.changeEditState, 'emit');

    descriptionComponent.ngOnInit();
    descriptionComponent.changeToEditMode();
    expect(descriptionComponentEditState).toHaveBeenCalledTimes(1);
    expect(descriptionComponent.issueDescriptionForm.value).toEqual({ description: thisIssue.description });
  });

  it('should not have its value updated with issue description is invalid', () => {
    descriptionComponent.issue.description = undefined;
    descriptionComponent.ngOnInit();
    descriptionComponent.changeToEditMode();
    expect(descriptionComponent.issueDescriptionForm.value).toEqual({ description: '' });
  });

  it('should highlight conflicting changes, if the issue description was updated simultaneously by another user', () => {
    // Simulation of getting updated issue from Github.
    const updatedIssue = thisIssue.clone(phaseService.currentPhase);
    updatedIssue.description = 'Issue description was modified simultaneously on GitHub';
    issueService.issues = [];
    issueService.issues[updatedIssue.id] = updatedIssue;
    descriptionComponent.issue = thisIssue;

    const viewChangesCall = spyOn(descriptionComponent, 'viewChanges');

    const form = new NgForm([], []);
    descriptionComponent.ngOnInit();
    descriptionComponent.changeToEditMode();

    issueService.getLatestIssue.and.callFake((x: number) => of(updatedIssue));
    dialog.open.and.callFake((x: any) => {});
    errorHandlingService.handleError.and.callFake((x: any) => {});
    descriptionComponent.updateDescription(form);

    expect(viewChangesCall).toHaveBeenCalledTimes(1);
    expect(descriptionComponent.conflict.outdatedContent).toEqual(thisIssue.description);
    expect(descriptionComponent.conflict.updatedContent).toEqual(updatedIssue.description);
  });

  it('should be configured correctly when description is updated', () => {
    const form = new NgForm([], []);
    const formResetForm = spyOn(form, 'resetForm');
    const issueUpdatedEmit = spyOn(descriptionComponent.issueUpdated, 'emit');
    const resetCall = spyOn(descriptionComponent, 'resetToDefault');

    descriptionComponent.ngOnInit();
    descriptionComponent.changeToEditMode();

    issueService.getLatestIssue.and.callFake((x: number) => of(thisIssue));
    issueService.updateIssue.and.callFake((x: Issue) => of(x));
    descriptionComponent.updateDescription(form);

    expect(formResetForm).toHaveBeenCalledTimes(1);
    expect(issueUpdatedEmit).toHaveBeenCalledTimes(1);
    expect(resetCall).toHaveBeenCalledTimes(1);
  });
});
