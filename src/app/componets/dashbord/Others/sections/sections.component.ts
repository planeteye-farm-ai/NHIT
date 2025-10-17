import { Component } from '@angular/core';
import * as prismCodeData from '../../../../shared/prismData/tables';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { AddSectionComponent } from './add-section/add-section.component';

@Component({
  selector: 'app-sections',
  standalone: true,
  imports: [SharedModule,ShowcodeCardComponent,AddSectionComponent],
  templateUrl: './sections.component.html',
  styleUrl: './sections.component.scss'
})
export class SectionsComponent {

  prismCode = prismCodeData;

  sectionData = [
    { sectionId: 1, sectionName:'section 1', chainageStart: 88.00, chainageEnd: 98.00, contractor: 'Harshrath', distance: '10 km', cost: '10 cr' },
    { sectionId: 2, sectionName:'section 2', chainageStart: 88.20, chainageEnd: 67.67, contractor: 'Zozo Hadid', distance: '15 km', cost: '20 cr' },
    { sectionId: 3, sectionName:'section 3', chainageStart: 58.00, chainageEnd: 45.89, contractor: 'Martiana', distance: '5 km', cost: '4 cr' },
    { sectionId: 4, sectionName:'section 4', chainageStart: 78.00, chainageEnd: 89.90, contractor: 'Alex Carey', distance: '7 km', cost: '4 cr' }
  ];
}
