import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/tables';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';

import { ViewEncapsulation } from '@angular/core';
import {NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import * as prismCodeData1 from '../../../../shared/prismData/advancedUi/models'
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AddRoadFurnituresComponent } from './add-road-furnitures/add-road-furnitures.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-road-furnitures',
  standalone: true,
  imports: [SharedModule,NgSelectModule ,FormsModule, ShowcodeCardComponent,ReactiveFormsModule,AddRoadFurnituresComponent],
  templateUrl: './road-furnitures.component.html',
  styleUrl: './road-furnitures.component.scss'
})
export class RoadFurnituresComponent {
  prismCode = prismCodeData;
  roadForm!: FormGroup;
  content2: any;
  content:any;

  selectedAssetType: any=['Bridges','Sign Boards'];


  tableData = [
    { id: 1,nhNumber:'NH-1',sectionCode:'SAN',latitude: 19.965681, longitude: 73.626424, chainageStart: 100,chainageEnd:102.27,direction:'Increasing',assetCharcters:'Road Furnitures',assetType:'Bridges'},
    { id: 2,nhNumber:'NH-2',sectionCode: 'ZAN',latitude: 19.965532, longitude: 73.625799, chainageStart: 102.27,chainageEnd:104.54,direction:'Increasing',assetCharcters:'Road Furnitures',assetType:'Traffic Signals'},
    { id: 3,nhNumber:'NH-1',sectionCode: 'MAN',latitude: 19.965018, longitude: 73.625796, chainageStart: 104.54,chainageEnd:106.81,direction:'Decreasing',assetCharcters:'Way Side Amenities',assetType:'Kilometer Stones'},
    { id: 3,nhNumber:'NH-1',sectionCode: 'RAN',latitude: 19.965018, longitude: 73.625796, chainageStart: 106.81,chainageEnd:109.08,direction:'Decreasing',assetCharcters:'Way Side Amenities',assetType:'Bus Stop'},
    { id: 4,nhNumber:'NH-3',sectionCode: 'RAN',latitude: 19.965018, longitude: 73.625799, chainageStart: 109.08,chainageEnd:111.35,direction:'Median',assetCharcters:'Way Side Amenities',assetType:'Tunnels'},
    { id: 5,nhNumber:'NH-3',sectionCode: 'RAN',latitude: 19.965018, longitude: 73.625799, chainageStart: 109.08,chainageEnd:111.35,direction:'Median',assetCharcters:'Way Side Amenities',assetType:'Footpath'},
    { id: 6,nhNumber:'NH-3',sectionCode: 'RAN',latitude: 19.965018, longitude: 73.625799, chainageStart: 109.08,chainageEnd:111.35,direction:'Median',assetCharcters:'Way Side Amenities',assetType:'Junction'},
    { id: 6,nhNumber:'NH-3',sectionCode: 'RAN',latitude: 19.965018, longitude: 73.625799, chainageStart: 109.08,chainageEnd:111.35,direction:'Median',assetCharcters:'Way Side Amenities',assetType:'Junction'},
    { id: 6,nhNumber:'NH-3',sectionCode: 'RAN',latitude: 19.965018, longitude: 73.625799, chainageStart: 109.08,chainageEnd:111.35,direction:'Median',assetCharcters:'Way Side Amenities',assetType:'Sign Boards'},



  ];

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,) {
    
  }
  ngOnInit(): void {
    this.roadForm = this.fb.group({
      nhNumber: ['NH-1', Validators.required],
      sectionCode: ['SAN', Validators.required],
      chainageStart: [100, Validators.required],
      chainageEnd: [102.27, Validators.required],
      direction: ['Increasing', Validators.required],
      assetCharcters: ['Road Furnitures', Validators.required],
      assetType: ['Bridges', Validators.required],

    });
  }

  onSubmit(): void {
    if (this.roadForm.valid) {
      this.toastr.success('Road furniture updated successfully', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      // this.roadForm.reset();
    } else {
      this.toastr.error('Invalid details', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    }
      
  }

  delete(){
    this.toastr.success('Road furniture deleted successfully', 'NHAI RAMS', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
    });
  }

  open(content: any) {
    this.modalService.open(content);
  }

  openVerticallyCentered(content2:any) {
		this.modalService.open(content2, { size: 'lg' },);
	}

}
