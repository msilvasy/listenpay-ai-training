/* Clinical Signal Console: reusable learning rows foreground a title, completion state, and date in a scan-first clinical list. */
import { Component, input } from '@angular/core';
import { LearningModule } from '../../portal.models';

@Component({
  selector: 'app-content-row',
  templateUrl: './content-row.component.html',
  styleUrl: './content-row.component.css',
})
export class ContentRow {
  readonly item = input.required<LearningModule>();
}
