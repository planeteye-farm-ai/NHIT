import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router,RouterLink } from '@angular/router'
import { MaterialManagementService } from '../../../../material-management.service';
import { Stock } from '../../../../material';


@Component({
  selector: 'app-view-transfer-stock',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-transfer-stock.component.html',
  styleUrl: './view-transfer-stock.component.scss'
})
export class ViewTransferStockComponent {
  stockForm!: FormGroup;
    prismCode = prismCodeData;
    topTitle:any;
    clientList:any;
    productList:any;
    batchList:any=[];
    st_id:any;
    status:any;
    constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private materialService:MaterialManagementService,
      private router: Router,
      private route: ActivatedRoute,
      ) {
    }

    ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        this.st_id = Number(params.get('id'));
        if (this.st_id) {
          this.loadStockDetails(this.st_id);
        }
      });
      this.stockForm = this.fb.group({
        client_id: [''],
        location: [''],
        date: [''], 
        remark: [''], 
        transferStockItems: this.fb.array([]),
      })
    }

    loadStockDetails(id:number){
      this.materialService.getStockDetailsById(id).subscribe((res) =>{
        // console.log(res)
        if(res){
          // this.topTitle = res.invoiceData[0].supplier_invoice_no;
          this.status = res.stockData[0].status;
         console.log(this.status)

          this.patchValue(res);
        }
      },(err) => {
        this.toastr.error(err.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      });
      }

      patchValue(Stock:any){
      this.stockForm.patchValue({
        client_id: Stock.stockData[0].comp_id ,
        location: Stock.stockData[0].location , 
        date: Stock.stockData[0].on_date ,
        remark: Stock.stockData[0].remark ,
      })
      console.log(Stock)
      this.transferStockItems.clear();
      
      Stock.stockProductArray.forEach((item: any, index: number) => {
        this.transferStockItems.push(this.createStockItem(item, index));
      });
      }

      createStockItem(item: any, index:any): FormGroup {
      return this.fb.group({
        prod_ref_name: [item.product_name],
        transfer_qty: [item.transfer_qty],
        transfer_rate: [item.transfer_rate],
        batch_no: [item.batch_no],
        // lot_no:[item.lot_no]
      });
      
    }
    get transferStockItems(): FormArray {
      return this.stockForm.get('transferStockItems') as FormArray;
    }

    confirmStock(){
      if(this.st_id !== null){
        this.materialService.confirmStock(this.st_id).subscribe((res) =>{
          if(res.status){
            this.loadStockDetails(this.st_id)
            this.toastr.success(res.msg, 'NHAI RAMS',{
              timeOut:3000,
              positionClass: 'toast-top-right'
            });
          }else{
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

}
