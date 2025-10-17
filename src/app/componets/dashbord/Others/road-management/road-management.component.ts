import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/tables';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { AddModelComponent } from './add-model/add-model.component';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';

// for edit
import { ViewEncapsulation } from '@angular/core';
import {NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import * as prismCodeData1 from '../../../../shared/prismData/advancedUi/models'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-road-management',
  standalone: true,
  imports: [SharedModule, ShowcodeCardComponent,RouterLink,AddModelComponent,ReactiveFormsModule],
  templateUrl: './road-management.component.html',
  styleUrl: './road-management.component.scss',
  providers: [ NgbModal],
})
export class RoadManagementComponent {
  prismCode = prismCodeData;

  tableData = [
    { id: 1, projectName: '#5182-3467', name: 'Harshrath', amount: '10 cr' },
    { id: 2, projectName: '#5182-3412', name: 'Zozo Hadid', amount: '20 cr' },
    { id: 3, projectName: '#5182-3423', name: 'Martiana', amount: '4 cr' },
    { id: 4, projectName: '#5182-3456', name: 'Alex Carey', amount: '4 cr' }
  ];
 

  // constructor(private modalService: NgbModal,public renderer: Renderer2){

  // }
  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,) {
    
  }


  openAddNewModal() {
    this.modalService.open(AddModelComponent, { centered: true });
  }


  // for edit

  roadForm!: FormGroup;
  content2: any;

 

  ngOnInit(): void {
    this.roadForm = this.fb.group({
      projectNo: ['#5182-3467', Validators.required],
      roadName: ['Harshrath', Validators.required],
      cost: ['10 cr', [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.roadForm.valid) {
      this.toastr.success('Road updated successfully', 'NHAI RAMS', {
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

  open(content: any) {
    this.modalService.open(content);
  }
  
  openVerticallyCentered(content2:any) {
		this.modalService.open(content2, { size: 'lg' },);
	}

  delete(){
    this.toastr.success('Road type deleted successfully', 'NHAI RAMS', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
    });
  }

  

}

// import { Component, ViewChild, AfterViewInit } from '@angular/core';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatSort } from '@angular/material/sort';
// import { MatPaginator } from '@angular/material/paginator';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import * as prismCodeData from '../../../shared/prismData/tables';
// import { AddModelComponent } from './add-model/add-model.component';
// import { SharedModule } from '../../../shared/common/sharedmodule';
// import { ShowcodeCardComponent } from '../../../shared/common/includes/showcode-card/showcode-card.component';
// import { RouterLink } from '@angular/router';
// import { MatTableModule } from '@angular/material/table';
// import { MatSortModule } from '@angular/material/sort';
// import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';

// @Component({
//   selector: 'app-road-management',
//   standalone: true,
//   imports: [SharedModule, ShowcodeCardComponent,RouterLink,AddModelComponent,MatTableModule,
//     MatSortModule,
//     MatPaginatorModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatIconModule],
//   templateUrl: './road-management.component.html',
//   styleUrl: './road-management.component.scss',
//   providers: [NgbModal],
// })
// export class RoadManagementComponent implements AfterViewInit {
//   prismCode = prismCodeData;
//   displayedColumns: string[] = ['id', 'projectName', 'name', 'amount', 'action'];
//   dataSource = new MatTableDataSource([
//     { id: 1, projectName: '#5182-3467', name: 'Harshrath', amount: '10 cr' },
//     { id: 2, projectName: '#5182-3412', name: 'Zozo Hadid', amount: '20 cr' },
//     { id: 3, projectName: '#5182-3423', name: 'Martiana', amount: '4 cr' },
//     { id: 4, projectName: '#5182-3456', name: 'Alex Carey', amount: '4 cr' },
//   ]);

//   @ViewChild(MatSort) sort!: MatSort;
//   @ViewChild(MatPaginator) paginator!: MatPaginator;

//   constructor(private modalService: NgbModal) {}

//   ngAfterViewInit() {
//     this.dataSource.sort = this.sort;
//     this.dataSource.paginator = this.paginator;
//   }

//   applyFilter(event: Event) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     this.dataSource.filter = filterValue.trim().toLowerCase();
//   }

//   openAddNewModal() {
//     this.modalService.open(AddModelComponent, { centered: true });
//   }
// }
