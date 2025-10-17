import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../shared/prismData/tables';
import { SharedModule } from '../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AddWaysideAmenitiesComponent } from './add-wayside-amenities/add-wayside-amenities.component';
@Component({
  selector: 'app-wayside-amenities',
  standalone: true,
  imports: [SharedModule, ShowcodeCardComponent,AddWaysideAmenitiesComponent],
  templateUrl: './wayside-amenities.component.html',
  styleUrl: './wayside-amenities.component.scss',
  providers: [ NgbModal],
})
export class WaysideAmenitiesComponent {

  prismCode = prismCodeData;

  waysideAmenitiesData = [
    { id: 1, waysideAmenities: 'Bus Shelter', status: 'Active' },
    { id: 2, waysideAmenities: 'Restaurants/Motel', status: 'Active'},
    { id: 3, waysideAmenities: 'Toilet/Public convenience', status: 'Active' },
    { id: 4, waysideAmenities: 'Toll Plaza', status: 'Active' },
    { id: 5, waysideAmenities: 'First aid/Medical centre', status: 'Active' },
    { id: 6, waysideAmenities: 'Telephone Booth', status: 'Active' },
    { id: 7, waysideAmenities: 'Petrol Pump/Minor Repair Shop', status: 'Active' },
    { id: 8, waysideAmenities: 'Police Station', status: 'Active' },
    { id: 9, waysideAmenities: 'Bridge', status: 'Active' },
    { id: 10, waysideAmenities: 'Culverts', status: 'Active' },
    { id: 11, waysideAmenities: 'Grade Separator', status: 'Active' },
    { id: 12, waysideAmenities: 'Elevated Road', status: 'Active' },
    { id: 13, waysideAmenities: 'Vehicle Under Pass', status: 'Active' },
    { id: 14, waysideAmenities: 'Flyover', status: 'Active' },
    { id: 15, waysideAmenities: 'ROB', status: 'Active' },
    { id: 16, waysideAmenities: 'Religious structures', status: 'Active' },
    { id: 17, waysideAmenities: 'Temple/Mosque', status: 'Active' },

  ];
 

  constructor(private modalService: NgbModal){

  }

}
