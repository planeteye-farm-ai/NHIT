import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router'
import { BulkStockUpdateService } from '../bulk-stock-update.service';

@Component({
  selector: 'app-bulk-inward',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './bulk-inward.component.html',
  styleUrl: './bulk-inward.component.scss'
})
export class BulkInwardComponent {

  stockUpdateForm!: FormGroup;
  prismCode = prismCodeData;
  stateList:any;
    constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private bulkStockService:BulkStockUpdateService,
      private router: Router,
      ) {
      
    }

    ngOnInit(): void {
      this.stockUpdateForm = this.fb.group({
        stockUpdateItems: this.fb.array([]),
      })
      this.addStockItem();
    }

    addStockItem() {
      const itemGroup = this.fb.group({
        prod_ref_name: ['',Validators.required],
        inward_qty: ['', Validators.required],
      });
      this.stockUpdateItems.push(itemGroup);
    }

    get stockUpdateItems(): FormArray {
      return this.stockUpdateForm.get('stockUpdateItems') as FormArray;
    }

    removeRow(index: number){
      this.stockUpdateItems.removeAt(index)
    }

    onSubmit():void{
      console.log(this.stockUpdateForm);
    }
}
