import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { PurchaseInvoiceService } from '../purchase-invoice.service';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../shared/common/custom-validators'; 
import { ActivatedRoute, RouterLink } from '@angular/router';


@Component({
  selector: 'app-view-invoice',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-invoice.component.html',
  styleUrl: './view-invoice.component.scss'
})
export class ViewInvoiceComponent {

  purchaseForm!: FormGroup;
      prismCode = prismCodeData;
      topTitle:any;
      supl_inv_id:any;
    invoiceStatus:any;

  
     constructor(private fb: FormBuilder,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private purchaseService:PurchaseInvoiceService,
        private route: ActivatedRoute,
        ) {
      
      }
  
      ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
          this.supl_inv_id = Number(params.get('id'));
          if (this.supl_inv_id) {
            this.loadInvoiceDetails(this.supl_inv_id);
            // console.log(this.supl_inv_id)
          }
        });
        this.purchaseForm = this.fb.group({
          supplier_id: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          supplier_invoice_no: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]], 
          supplier_invoice_date: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          discount_amount: ['',[CustomValidators.noWhitespaceValidator()]],
          invoice_state_id: ['',[Validators.required]],
          purchaseInvoiceItems: this.fb.array([]),
        })
      }

      loadInvoiceDetails(id:number){
        this.purchaseService.getDetailsById(id).subscribe((res) =>{
          // console.log(res)
          if(res){
            this.topTitle = res.invoiceData[0].supplier_invoice_no;
          this.invoiceStatus = res.invoiceData[0].invoice_status;

            this.patchValue(res);
          }
        },(err) => {
          this.toastr.error(err.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        });
       }

       patchValue(Invoice:any){
        this.purchaseForm.patchValue({
          supplier_id: Invoice.invoiceData[0].supl_comp ,
          supplier_invoice_no: Invoice.invoiceData[0].supplier_invoice_no , 
          supplier_invoice_date: Invoice.invoiceData[0].supplier_invoice_date ,
        })
        // console.log(Invoice.invoiceProductData)
        this.purchaseInvoiceItems.clear();
        // Populate purchaseInvoiceItems dynamically
        Invoice.invoiceProductData.forEach((item: any) => {
          this.purchaseInvoiceItems.push(this.createPurchaseItem(item));
        });
       }

       get purchaseInvoiceItems(): FormArray {
        return this.purchaseForm.get('purchaseInvoiceItems') as FormArray;
      }
       
     createPurchaseItem(item: any): FormGroup {
      return this.fb.group({
        prod_ref_name: [item.product_name],
        po_qty: [item.qty],
        po_rate: [item.rate],
        batch_no: [item.batch_number],
      });
    }

    confirmInvoice(){
      if(this.supl_inv_id !== null){
        this.purchaseService.confirmPurchaseInvoice(this.supl_inv_id).subscribe((res) =>{
          if(res.status){
            this.loadInvoiceDetails(this.supl_inv_id)
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