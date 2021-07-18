import { GithubIssue } from '../github-issue.model';
import { GithubResponse } from '../github-response.model';

/**
 * A model that is used to manage the cache of multiple list of issues paginated by pages.
 * Example of a single list of issues: https://developer.github.com/v3/issues/#list-issues-for-a-repository
 */
export class IssuesCacheManager {
  // An array of cache github responses containing the array of GithubIssue as its data
  // The index in this array represents (page number - 1)
  private issuesCache: GithubResponse<GithubIssue[]>[];

  constructor() {
    this.issuesCache = [];
  }

  getEtagFor(pageNumber: number): string {
    const cachedResponse = this.get(pageNumber);
    let latestEtag = '';
    if (cachedResponse !== undefined) {
      latestEtag = cachedResponse.headers.etag;
    }
    return latestEtag;
  }

  get(pageNumber: number): GithubResponse<GithubIssue[]> {
    return this.issuesCache[pageNumber - 1];
  }

  set(pageNumber: number, response: GithubResponse<GithubIssue[]>): void {
    response.isCached = true;
    this.issuesCache[pageNumber - 1] = response;
  }

  clear(): void {
    this.issuesCache = [];
  }
}
