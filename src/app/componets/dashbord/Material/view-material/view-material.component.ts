import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { MaterialManagementService } from '../material-management.service';
import { Material } from '../material';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../shared/common/custom-validators'; 
import { ActivatedRoute,RouterLink } from '@angular/router';

@Component({
  selector: 'app-view-material',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-material.component.html',
  styleUrl: './view-material.component.scss'
})
export class ViewMaterialComponent {

    materialForm!: FormGroup;
    prismCode = prismCodeData;
    topTitle:any;
    pid:any;

   constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private materialService:MaterialManagementService,
      private route: ActivatedRoute,
      ) {
    
    }

    ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        this.pid = Number(params.get('id'));
        if (this.pid) {
          this.loadMaterialDetails(this.pid);
        }
      });
      this.materialForm = this.fb.group({
        product_name: [''],
        product_desc: [''], 
        prod_unit: [''],
        prod_type: [''],
        batch_no: [''],
        other_type: [''],
      })
    }

    loadMaterialDetails(id:number): void{
      this.materialService.getDetailsById(id).subscribe((res) => {
        if(res){
          this.topTitle = res.data[0].product_name;
          this.patchValue(res);
          // console.log(res )
        }
      },(err) => {
        this.toastr.error(err.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      });
     }

     patchValue(Material:any){
      this.materialForm.patchValue({
        product_name: Material.data[0].product_name,
        product_desc:Material.data[0].product_desc,
        prod_unit:Material.data[0].prod_unit,
        prod_type:Material.data[0].prod_type,
        other_type:Material.data[0].other_type,
      })
     }
}
