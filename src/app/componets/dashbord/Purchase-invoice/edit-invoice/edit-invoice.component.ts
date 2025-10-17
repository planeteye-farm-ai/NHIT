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
import { ActivatedRoute, Router,RouterLink } from '@angular/router'
import { Purchase } from '../Purchase';

@Component({
  selector: 'app-edit-invoice',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-invoice.component.html',
  styleUrl: './edit-invoice.component.scss'
})
export class EditInvoiceComponent {

    purchaseForm!: FormGroup;
    prismCode = prismCodeData;
    topTitle:any;
    stateList:any;
    supl_inv_id:any;
    supplierlist:any;
    productList:any;
    
    constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private purchaseService:PurchaseInvoiceService,
      private router: Router,
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
        // discount_amount: ['',[CustomValidators.noWhitespaceValidator()]],
        // invoice_state_id: ['',[Validators.required]],
        purchaseInvoiceItems: this.fb.array([]),
      })
      this.getStateList();
      this.addInspectionItem();
      this.getSupplierList();
      this.getProductList();
    }

    loadInvoiceDetails(id:number){
      this.purchaseService.getDetailsById(id).subscribe((res) =>{
        // console.log(res)
        if(res){
          this.topTitle = res.invoiceData[0].supplier_invoice_no;
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
        supplier_id: Invoice.invoiceData[0].supplier_id ,
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

     createPurchaseItem(item: any): FormGroup {
      return this.fb.group({
        prod_ref_name: [item.product_id, [Validators.required]],
        po_qty: [item.qty, [Validators.required]],
        po_rate: [item.rate, [Validators.required]],
        batch_no: [item.batch_number, [Validators.required]],
      });
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
            return;
          }
          else{
            let purchaseObj:Purchase = {
              supplier_id:this.purchaseForm.get('supplier_id')?.value,
              supplier_invoice_no: this.purchaseForm.get('supplier_invoice_no')?.value,
              supplier_invoice_date: this.purchaseForm.get('supplier_invoice_date')?.value,
              purchaseInvoiceItems: this.purchaseForm.get('purchaseInvoiceItems')?.value,
            }
            // console.log(purchaseObj)
              this.purchaseService.updatePurchaseInvoice(purchaseObj,this.supl_inv_id).subscribe((res) => {
              if(res.status){
                this.loadInvoiceDetails(this.supl_inv_id);
                this.toastr.success(res.msg, 'NHAI RAMS', {
                  timeOut: 3000,
                  positionClass: 'toast-top-right',
                });
              } else {
                this.toastr.error(res.msg, 'NHAI RAMS', {
                  timeOut: 3000,
                  positionClass: 'toast-top-right',
                });
              }
              },  (err)=>{
              this.toastr.error(err.msg, 'NHAI RAMS', {
                timeOut: 3000,
                positionClass: 'toast-top-right',
              });
            });
            }
              
          }
          
    }