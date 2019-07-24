import {Injectable} from '@angular/core';
import {Observable, of, BehaviorSubject} from 'rxjs';
import {GithubService} from './github.service';
import {IssueComment, IssueComments} from '../models/comment.model';
import {map} from 'rxjs/operators';
import * as moment from 'moment';
import { TesterResponse } from '../models/tester-response.model';

@Injectable({
  providedIn: 'root',
})
export class IssueCommentService {
  // A map from issueId to their respective issue comments.
  comments = new Map<number, IssueComments>();
  comments$: BehaviorSubject<IssueComments>;

  constructor(private githubService: GithubService) {
  }

  getIssueComments(issueId: number): Observable<IssueComments> {
    if (!this.comments.get(issueId)) {
      return this.initializeIssueComments(issueId);
    } else {
      return this.comments$;
    }
  }

  createIssueComment(issueId: number, description: string): Observable<IssueComment> {
    return this.githubService.createIssueComment(<IssueComment>{
      id: issueId,
      description: description,
    }).pipe(
      map((response) => {
        return this.createIssueCommentModel(response);
      })
    );
  }

  updateIssueComment(issueComment: IssueComment): Observable<IssueComment> {
    return this.githubService.updateIssueComment({
      ...issueComment,
      description: issueComment.description,
    }).pipe(
      map((response) => {
        return this.createIssueCommentModel(response);
      })
    );
  }

  createGithubIssueCommentDescription(teamResponse: string, testerResponses: TesterResponse[]): string {
    return `# Team\'s Response\n${teamResponse}\n ` +
          `# Items for the Tester to Verify\n${this.getTesterResponsesString(testerResponses)}`;
  }

  private getTesterResponsesString(testerResponses: TesterResponse[]): string {
    let testerResponsesString = '';
    for (const testerResponse of testerResponses) {
      testerResponsesString += testerResponse.toString();
    }
    return testerResponsesString;
  }

  private initializeIssueComments(issueId: number): Observable<IssueComments> {
    return this.githubService.fetchIssueComments(issueId).pipe(
      map((comments: []) => {
        const issueComments = <IssueComments>{
          issueId: issueId,
          comments: [],
        };
        for (const comment of comments) {
          issueComments.comments.push(this.createIssueCommentModel(comment));
        }
        this.comments.set(issueId, <IssueComments>{...issueComments, issueId: issueId});
        this.comments$ = new BehaviorSubject<IssueComments>(this.comments.get(issueId));
        return this.comments.get(issueId);
      })
    );
  }

  /**
   * To add/update an issue.
   */
  updateLocalStore(commentsToUpdate: IssueComments) {
    this.comments.set(commentsToUpdate.issueId, commentsToUpdate);
    this.comments$.next(commentsToUpdate);
  }

  reset() {
    this.comments.clear();
    this.comments$.next(null);
  }

  private createIssueCommentModel(issueCommentInJson: {}): IssueComment {
    return <IssueComment>{
      id: issueCommentInJson['id'],
      createdAt: moment(issueCommentInJson['created_at']).format('lll'),
      updatedAt: moment(issueCommentInJson['updated_at']).format('lll'),
      description: issueCommentInJson['body'],
    };
  }
}
