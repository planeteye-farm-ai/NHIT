import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/tables';
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoadService } from '../../manage-road/road.service'; 

@Component({
  selector: 'app-rigid-distress',
  standalone: true,
  imports: [CommonModule,SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,ReactiveFormsModule,RouterLink,ShowcodeCardComponent],
  templateUrl: './rigid-distress.component.html',
  styleUrl: './rigid-distress.component.scss'
})
export class RigidDistressComponent {

      filterForm!: FormGroup;
      prismCode = prismCodeData;
      content:any;
      tableData:any;
      selectedId: number | null = null;
      startDate:any;
      endDate:any;
      geometryList:any;
  
      constructor(config: NgbModalConfig, 
        private modalService: NgbModal,
        private toastr: ToastrService,
        private roadService:RoadService,
        private fb: FormBuilder,
      ) {
      
      }
  
      ngOnInit(): void {
        this.filterForm = this.fb.group({
          geometry_data_id : [null],
          start_date : [''],
          end_date : ['']
        });
        const currentDate = new Date();
        // Get the first day of the current month
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
        // Format dates to 'YYYY-MM-DD'
        this.startDate = firstDayOfMonth.toISOString().split('T')[0];
        this.endDate = currentDate.toISOString().split('T')[0];
        this.getDistressData();
        this.getGeometryList();
      }
     
      getGeometryList(){
        this.roadService.getGeometryList().subscribe((res) =>{
          this.geometryList = res.data;
          console.log(this.geometryList);
        })
      }
      getDistressData(){
        let dataObj = {
          geometry_data_id: this.filterForm.get('geometry_data_id')?.value,
          start_date : this.filterForm.get('start_date')?.value,
          end_date : this.filterForm.get('end_date')?.value
        }
        this.roadService.getRigidDistress(dataObj).subscribe((res)=>{
          console.log(" get rigid distress data list",res);
          this.tableData = res.data;
        })
      }

      filterDistress(){
        let dataObj = {
          geometry_data_id: this.filterForm.get('geometry_data_id')?.value,
          start_date : this.filterForm.get('start_date')?.value,
          end_date : this.filterForm.get('end_date')?.value
          }
          this.roadService.getRigidDistress(dataObj).subscribe((res)=>{
            console.log(" get rigid distress data list",res);
            this.tableData = res.data;
          })
      }

      resetFilter(){
        this.filterForm.reset();
      }
    
      delete(){
        if (this.selectedId !== null) {
          this.roadService.deleteRigidDistress(this.selectedId).subscribe((res)=>{
            // console.log("edelete result",res);
            if(res.status){
              this.getDistressData();
              this.toastr.success(res.msg, 'NHAI RAMS', {
                timeOut: 3000,
                positionClass: 'toast-top-right',
              });
            }
            else{
              this.toastr.error(res.msg, 'NHAI RAMS', {
                timeOut: 3000,
                positionClass: 'toast-top-right',
              });
            }
          },(err)=>{
            this.toastr.error(err.msg, 'NHAI RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          });
          
        }
      }
    
      open(content: any,id:any) {
        this.selectedId = id;
        this.modalService.open(content);
      }

}
