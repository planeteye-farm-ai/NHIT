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
  selector: 'app-edit-transfer-stock',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-transfer-stock.component.html',
  styleUrl: './edit-transfer-stock.component.scss'
})
export class EditTransferStockComponent {

  stockForm!: FormGroup;
      prismCode = prismCodeData;
      topTitle:any;
      clientList:any;
      productList:any;
      batchList:any=[];
      st_id:any;

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
          client_id: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          location: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          date: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]], 
          remark: ['',[CustomValidators.noWhitespaceValidator()]], 
          transferStockItems: this.fb.array([]),
        })
        this.addStockTransferItem();
        this.getClientList();
        this.getProductList();
      }

      loadStockDetails(id:number){
        this.materialService.getStockDetailsById(id).subscribe((res) =>{
          // console.log(res)
          if(res){
            // this.topTitle = res.invoiceData[0].supplier_invoice_no;
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
        

        this.transferStockItems.clear();
        // Populate transferStockItems dynamically
        // Stock.stockProductArray.forEach((item: any) => {
        //   this.transferStockItems.push(this.createStockItem(item));
        // });
        Stock.stockProductArray.forEach((item: any, index: number) => {
          this.transferStockItems.push(this.createStockItem(item, index));
        });
       }

       createStockItem(item: any, index:any): FormGroup {
        this.getBatchDropdwon(item.pid,index);
        return this.fb.group({
          prod_ref_name: [item.pid, [Validators.required]],
          transfer_qty: [item.transfer_qty, [Validators.required]],
          transfer_rate: [item.transfer_rate, [Validators.required]],
          batch_no: [item.batch_no, [Validators.required]],
          lot_no:[item.lot_no, [Validators.required]]
        });
        
      }
      getClientList(){
        this.materialService.getClientList().subscribe((res) => {
          this.clientList = res.data;
          // console.log('Clientlist',this.clientList)
        })
      }
    
      getProductList(){
        this.materialService.getProductList().subscribe((res) =>{
          this.productList = res.data;
          // console.log('productList',this.productList)
        })
      }

      addStockTransferItem() {
        const itemGroup = this.fb.group({
          prod_ref_name: ['',Validators.required],
          transfer_qty: ['', Validators.required],
          transfer_rate: ['', Validators.required],
          batch_no: ['', Validators.required],
          lot_no:['']
        });
        this.transferStockItems.push(itemGroup);
      }
    
      get transferStockItems(): FormArray {
        return this.stockForm.get('transferStockItems') as FormArray;
      }
      
      removeRow(index: number){
        this.transferStockItems.removeAt(index)
      }

      getBatchDropdwon(pid:any,index:any):void{
        // console.log('worling')
        const product = this.transferStockItems.at(index);
        this.materialService.getBatchDropdwon(pid).subscribe((res) =>{
          this.batchList[index] = res.data;
           
        })
      }

    
      setLotNo(index:any){
        const product = this.transferStockItems.at(index);
        const selectedBatchNo = product.get('batch_no')?.value;
        // let lot_no  = this.batchList.filter((element:any) => element.batch_no.includes(product.get('prod_ref_name')?.value))
        const selectedBatch = this.batchList[index].find((batch: any) => batch.batch_no === selectedBatchNo);
        product.get('lot_no')?.setValue(selectedBatch.lot_no);
        console.log(selectedBatch)
    
      }

       onSubmit():void{
          if(this.stockForm.invalid){
            this.stockForm.markAllAsTouched();
            return;
          }
          else{
            let stockObj:Stock = {
              client_id: this.stockForm.get('client_id')?.value,
              date: this.stockForm.get('date')?.value,
              location: this.stockForm.get('location')?.value,
              remark: this.stockForm.get('remark')?.value,
              transferStockItems:this.stockForm.get('transferStockItems')?.value,
            }
            // console.log(purchaseObj)
              this.materialService.updateStock(stockObj,this.st_id).subscribe((res) => {
              if(res.status){
                this.loadStockDetails(this.st_id);
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
