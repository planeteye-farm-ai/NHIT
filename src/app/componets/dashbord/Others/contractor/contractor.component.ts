import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/tables';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AddContractorComponent } from './add-contractor/add-contractor.component';

@Component({
  selector: 'app-contractor',
  standalone: true,
  imports: [SharedModule, ShowcodeCardComponent,AddContractorComponent],
  templateUrl: './contractor.component.html',
  styleUrl: './contractor.component.scss',
  providers: [ NgbModal],
})
export class ContractorComponent {
  prismCode = prismCodeData;

  tableData = [
    { id: 1, gstNO: '#5182-3467', name: 'Harshrath', phone: '1045223324' },
    { id: 2, gstNO: '#5182-3412', name: 'Zozo Hadid', phone: '2045223324' },
    { id: 3, gstNO: '#5182-3423', name: 'Martiana', phone: '4452233243' },
    { id: 4, gstNO: '#5182-3456', name: 'Alex Carey', phone: '4945223324' }
  ];
 

  constructor(private modalService: NgbModal,public renderer: Renderer2){

  }

 

}
