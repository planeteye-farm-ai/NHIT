import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../shared/prismData/tables';
import { SharedModule } from '../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AddLandUseComponent } from './add-land-use/add-land-use.component';

@Component({
  selector: 'app-land-use',
  standalone: true,
  imports: [SharedModule, ShowcodeCardComponent,AddLandUseComponent],
  templateUrl: './land-use.component.html',
  styleUrl: './land-use.component.scss',
  providers: [ NgbModal],
})
export class LandUseComponent {
  prismCode = prismCodeData;

  landUseData = [
    { id: 1, land: 'Residential', status: 'Active' },
    { id: 2, land: 'Commercial', status: 'Active'},
    { id: 3, land: 'Industrial', status: 'Active' },
    { id: 4, land: 'Agricultural', status: 'Active' },
    { id: 5, land: 'Water Bodies', status: 'Active' },
    { id: 6, land: 'Mixed', status: 'Active' },


  ];
 

  constructor(private modalService: NgbModal){

  }

}
