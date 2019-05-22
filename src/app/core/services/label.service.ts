import { Injectable } from '@angular/core';
import {GithubService} from './github.service';
import {map} from 'rxjs/operators';
import {Label} from '../models/label.model';
import { Observable } from 'rxjs';
import {SEVERITY_ORDER} from '../../core/models/issue.model';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private severityLabels: Label[];
  private typeLabels: Label[];
  private responseLabels: Label[];
  private labelRetrieved: boolean;

  constructor(private githubService: GithubService) {
    this.severityLabels = new Array();
    this.typeLabels = new Array();
    this.responseLabels = new Array();
    this.labelRetrieved = false;
  }

  // Calls the github api to get all labels from the repository
  getAllLabels(): Observable<void> {
    return this.githubService.fetchAllLabels().pipe(
      map((response) => {
        return this.populateLabelLists(response);
      })
    );
  }

  getLabelList(attributeName: string): Label[] {
    switch (attributeName) {
      case 'severity':
        return this.severityLabels;
      case 'type':
        return this.typeLabels;
      case 'responseTag':
        return this.responseLabels;
    }
  }

  private populateLabelLists(labels: Array<{}>): void {
    for (const label of labels) {
      // Get the name and color of each label and store them into the service's array list
      const labelName = String(label['name']).split('.');
      const labelType = labelName[0];
      const labelValue = labelName[1];
      const labelColor = String(label['color']);

      switch (labelType) {
        case 'severity':
          this.severityLabels.push({labelValue: labelValue, labelColor: labelColor});
          break;
        case 'type':
          this.typeLabels.push({labelValue: labelValue, labelColor: labelColor});
          break;
        case 'response':
          this.responseLabels.push({labelValue: labelValue, labelColor: labelColor});
          break;
      }

    }
    // Sort the severity labels from Low to High
    this.severityLabels.sort((a, b) => {
      return SEVERITY_ORDER[a.labelValue] - SEVERITY_ORDER[b.labelValue];
    });

    this.labelRetrieved = true;
  }

  checkLabelRetrieved(): boolean {
    return this.labelRetrieved;
  }

  reset(): void {
    this.severityLabels.length = 0;
    this.typeLabels.length = 0;
    this.responseLabels.length = 0;
    this.labelRetrieved = false;
  }

  hexToRgb(hex: string) {
    const rgbResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return rgbResult ? {
      r: parseInt(rgbResult[1], 16),
      g: parseInt(rgbResult[2], 16),
      b: parseInt(rgbResult[3], 16)
    } : null;
  }

  setLabelStyle(color: string) {
    const r = this.hexToRgb('#'.concat(color)).r.toString();
    const g = this.hexToRgb('#'.concat(color)).g.toString();
    const b = this.hexToRgb('#'.concat(color)).b.toString();

    const styles = {
      'background-color' : 'rgb('.concat(r).concat(', ').concat(g).concat(', ').concat(b).concat(', 0.55'),
      'border-radius' : '3px',
      'padding' : '3px',
    };
    return styles;
  }

}
