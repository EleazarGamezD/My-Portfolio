import {Component} from '@angular/core';
import {IWorkReferences} from '@core/interfaces/work-references/work-references.interface';

@Component({
  selector: 'app-work-references',
  imports: [],
  templateUrl: './work-references.component.html',
  styleUrl: './work-references.component.scss'
})
export class WorkReferencesComponent {

  workReferences: IWorkReferences[] = [
    {
      name: 'John Doe',
      position: 'CEO',
      company: 'Company',
      testimonial: 'Text'
    },
    {
      name: 'Alice Smith',
      position: 'CTO',
      company: 'Company',
      testimonial: 'Text'
    },
    {
      name: 'George Brown',
      position: 'CFO',
      company: 'Company',
      testimonial: 'Text'
    },
    {
      name: 'Jane Doe',
      position: 'COO',
      company: 'Company',
      testimonial: 'Another text'
    }
  ];

}
