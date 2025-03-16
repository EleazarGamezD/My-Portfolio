import {Component} from '@angular/core';
import {SideIcons} from '@core/constants/sideIcons';
import {IWorkReferences} from '@core/interfaces/work-references/work-references.interface';
import {references} from '@shared/Json/workReferences';

@Component({
  selector: 'app-work-references',
  imports: [],
  templateUrl: './work-references.component.html',
  styleUrl: './work-references.component.scss'
})
export class WorkReferencesComponent {
  Icons = SideIcons
  workReferences: IWorkReferences[] = references
  downSideIcons: {url: string}[] = []
}
