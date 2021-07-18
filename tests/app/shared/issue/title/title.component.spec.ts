import { FormBuilder, NgForm } from '@angular/forms';
import { of } from 'rxjs';
import { Issue } from '../../../../../src/app/core/models/issue.model';
import { Phase } from '../../../../../src/app/core/models/phase.model';
import { PhaseService } from '../../../../../src/app/core/services/phase.service';
import { TitleComponent } from '../../../../../src/app/shared/issue/title/title.component';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../../constants/githubissue.constants';

describe('TitleComponent', () => {
  let titleComponent: TitleComponent;
  let issueService: any;
  let thisIssue: Issue;
  let formBuilder: any;
  let phaseService: PhaseService;

  beforeEach(() => {
    formBuilder = new FormBuilder();
    phaseService = new PhaseService(null, null, null);
    phaseService.currentPhase = Phase.phaseTeamResponse;

    issueService = jasmine.createSpyObj('IssueService', ['updateIssue']);
    titleComponent = new TitleComponent(issueService, formBuilder, null, null, phaseService);
    thisIssue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    titleComponent.issue = thisIssue;
  });

  it('should be initialised with an issueTitleForm', () => {
    titleComponent.ngOnInit();
    expect(titleComponent.issueTitleForm.value).toEqual({ title: '' });
  });

  it('should be updated with correct flags and values in editing mode', () => {
    titleComponent.ngOnInit();
    titleComponent.changeToEditMode();
    expect(titleComponent.isEditing).toEqual(true);
    expect(titleComponent.issueTitleForm.value).toEqual({ title: thisIssue.title });
  });

  it('should not have its value updated with issue title is invalid', () => {
    thisIssue.title = undefined;
    titleComponent.issue = thisIssue;
    titleComponent.ngOnInit();
    titleComponent.changeToEditMode();
    expect(titleComponent.isEditing).toEqual(true);
    expect(titleComponent.issueTitleForm.value).toEqual({ title: '' });
  });

  it('should be configured correctly when title is updated', () => {
    const form = new NgForm([], []);
    const formResetForm = spyOn(form, 'resetForm');
    const titleComponentEmitter = spyOn(titleComponent.issueUpdated, 'emit');

    titleComponent.ngOnInit();
    titleComponent.changeToEditMode();

    issueService.updateIssue.and.callFake((x: Issue) => of(x));
    titleComponent.updateTitle(form);

    expect(formResetForm).toHaveBeenCalledTimes(1);
    expect(titleComponentEmitter).toHaveBeenCalledTimes(1);
    expect(titleComponent.isEditing).toEqual(false);
  });
});
