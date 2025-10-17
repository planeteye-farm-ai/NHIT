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
import { Router,RouterLink } from '@angular/router'
import { PurchaseInvoiceService } from '../purchase-invoice.service';
import { Purchase } from '../Purchase';


@Component({
  selector: 'app-add-invoice',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-invoice.component.html',
  styleUrl: './add-invoice.component.scss'
})
export class AddInvoiceComponent {

    purchaseForm!: FormGroup;
    prismCode = prismCodeData;
    stateList:any;
    supplierlist:any;
    productList:any;
      constructor(private fb: FormBuilder,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private purchaseService:PurchaseInvoiceService,
        private router: Router,
        ) {
        
      }
  
      ngOnInit(): void {
        this.purchaseForm = this.fb.group({
          supplier_id: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          supplier_invoice_no: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]], 
          supplier_invoice_date: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          // discount_amount: ['',[CustomValidators.noWhitespaceValidator()]],
          // invoice_state_id: ['',[Validators.required]],
          purchaseInvoiceItems: this.fb.array([]),
        })
        this.getStateList();
        this.getSupplierList();
        this.getProductList();
        this.addInspectionItem();
      }

      addInspectionItem() {
        const itemGroup = this.fb.group({
          prod_ref_name: ['',Validators.required],
          po_qty: ['', Validators.required],
          po_rate: ['', Validators.required],
          batch_no: ['', Validators.required]
        });
        this.purchaseInvoiceItems.push(itemGroup);
      }

      get purchaseInvoiceItems(): FormArray {
        return this.purchaseForm.get('purchaseInvoiceItems') as FormArray;
      }
      
      getStateList(){
        this.purchaseService.getStateList().subscribe((res)=>{
          this.stateList = res.data;
        })
      }

      getSupplierList(){
        this.purchaseService.getSupplierList().subscribe((res) => {
          this.supplierlist = res.data;
          // console.log(this.supplierlist)
        })
      }

      getProductList(){
        this.purchaseService.getProductList().subscribe((res) =>{
          this.productList = res.data
        })
      }

      removeRow(index: number){
        this.purchaseInvoiceItems.removeAt(index)
      }
  
      onSubmit():void{
        if(this.purchaseForm.invalid){
          this.purchaseForm.markAllAsTouched();
        }else{
          let purchaseObj:Purchase = {
            supplier_id:this.purchaseForm.get('supplier_id')?.value,
            supplier_invoice_no: this.purchaseForm.get('supplier_invoice_no')?.value,
            supplier_invoice_date: this.purchaseForm.get('supplier_invoice_date')?.value,
            purchaseInvoiceItems: this.purchaseForm.get('purchaseInvoiceItems')?.value,
          }
          this.purchaseService.addPurchaseInvoice(purchaseObj).subscribe((res) => {
            if(res.status){
              this.router.navigate(['purchase-invoice']);
              this.toastr.success(res.msg, 'RAMS', {
                timeOut: 3000,
                positionClass: 'toast-top-right'
              });
              this.purchaseForm.reset();
            }else{
              this.toastr.error(res.msg, 'RAMS', {
                timeOut:3000,
                positionClass: 'toast-top-right',
              });
            }
          },
          (err) => {
            this.toastr.error(err.msg, 'RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          });
        }
      }
}
