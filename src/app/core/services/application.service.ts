import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig } from '../../../environments/environment';
import { GithubRelease } from '../models/github/github.release';
import { GithubService } from './github.service';

export const appVersion = AppConfig.version;

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  readonly currentVersion: string;
  latestVersion: string;
  latestReleaseUrl: string;

  constructor(private githubService: GithubService) {
    this.currentVersion = appVersion;
  }

  /**
   * Determines whether the application is outdated.
   */
  isApplicationOutdated(): Observable<boolean> {
    if (this.latestVersion) {
      return of(this.isOutdatedVersion(this.latestVersion, this.currentVersion));
    }

    return this.githubService.fetchLatestRelease().pipe(
      map((githubRelease: GithubRelease) => {
        this.latestVersion = githubRelease.tag_name.substring(1);
        this.latestReleaseUrl = githubRelease.html_url;
        return this.isOutdatedVersion(this.latestVersion, this.currentVersion);
      })
    );
  }

  /**
   * Determines whether the current version is outdated compared to the latest version.
   * @param latestVersion
   * @param currentVersion
   */
  private isOutdatedVersion(latestVersion: string, currentVersion: string): boolean {
    const result = this.compareVersions(latestVersion, currentVersion);
    return result === 1;
  }

  /**
   * Compares the 2 given string versions v1 and v2 assuming that the version string
   * has the following format: <number>.<number>...
   * If v1 is greater than v2, return 1
   * If v1 is less than v2, return -1
   * If v1 is equal to v2, return 0
   * @param v1 - The first version.
   * @param v2 - The second version.
   */
  private compareVersions(v1: string, v2: string): number {
    const v1Arr = v1.split('.');
    const v2Arr = v2.split('.');
    const k = Math.min(v1.length, v2.length);

    const v1IntArr: number[] = [];
    const v2IntArr: number[] = [];
    for (let i = 0; i < k; ++ i) {
      v1IntArr[i] = parseInt(v1Arr[i], 10);
      v2IntArr[i] = parseInt(v2Arr[i], 10);
      if (v1IntArr[i] > v2IntArr[i]) {
        return 1;
      }
      if (v1IntArr[i] < v2IntArr[i]) {
        return -1;
      }
    }
    return v1.length === v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
  }
}
