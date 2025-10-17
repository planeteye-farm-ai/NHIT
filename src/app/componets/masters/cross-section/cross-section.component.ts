import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../shared/prismData/tables';
import { SharedModule } from '../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AddCrossSectionComponent } from './add-cross-section/add-cross-section.component';

@Component({
  selector: 'app-cross-section',
  standalone: true,
  imports: [SharedModule, ShowcodeCardComponent,AddCrossSectionComponent],
  templateUrl: './cross-section.component.html',
  styleUrl: './cross-section.component.scss',
  providers: [ NgbModal],
})
export class CrossSectionComponent {

  prismCode = prismCodeData;

  crossSectionData = [
    { id: 1, crossSection: 'Cut', status: 'Active' },
    { id: 2, crossSection: 'Fill', status: 'Active'},
    { id: 3, crossSection: 'Cut And Fill', status: 'Active' },
    { id: 3, crossSection: 'Level', status: 'Active' },

    

  ];
 

  constructor(private modalService: NgbModal){

  }

}
