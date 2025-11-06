import { Component } from '@angular/core';
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../../road.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-road-inventory-pdf',
  standalone: true,
  imports: [SharedModule, CommonModule, RouterLink],
  templateUrl: './road-inventory-pdf.component.html',
  styleUrl: './road-inventory-pdf.component.scss',
})
export class RoadInventoryPdfComponent {
  inventoryId: any;
  inventoryData: any;

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private roadService: RoadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.inventoryId = Number(params.get('id'));
      if (this.inventoryId) {
        this.loadInventoryDetails(this.inventoryId);
      }
    });
  }

  loadInventoryDetails(id: number): void {
    // Try to load from localStorage first
    const testInventory = JSON.parse(
      localStorage.getItem('test_inventory') || '[]'
    );
    const found = testInventory.find(
      (inv: any) => inv.road_inventory_id === id
    );

    if (found) {
      this.inventoryData = found;
      console.log('Loaded inventory from localStorage:', this.inventoryData);
      this.toastr.success('Inventory details loaded', 'Success', {
        timeOut: 2000,
        positionClass: 'toast-top-right',
      });
    } else {
      // Fallback to API if not found in localStorage
      this.roadService.getInventoryById(id).subscribe(
        (inventory: any) => {
          console.log('get inventory details from API', inventory);
          if (inventory && inventory.data && inventory.data.length > 0) {
            this.inventoryData = inventory.data[0];
          }
        },
        (err) => {
          this.toastr.error('Failed to load inventory details', 'Error', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      );
    }
  }

  generatePDF(): void {
    const pdfContent = document.getElementById('pdf-content')!;

    this.toastr.info('Generating PDF...', 'Please wait', {
      timeOut: 0,
      positionClass: 'toast-top-right',
    });

    html2canvas(pdfContent, {
      useCORS: true,
      allowTaint: false,
      scale: 2,
    })
      .then((canvas) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;
        const pageHeightInPx = (canvas.width / pdfWidth) * pdfHeight;
        let position = 0;

        while (position < canvasHeight) {
          const canvasPage = document.createElement('canvas');
          const context = canvasPage.getContext('2d')!;
          canvasPage.width = canvas.width;
          canvasPage.height = pageHeightInPx;

          context.drawImage(canvas, 0, -position, canvas.width, canvasHeight);

          const imgData = canvasPage.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

          position += pageHeightInPx;
          if (position < canvasHeight) {
            pdf.addPage();
          }
        }

        const fileName = `${this.inventoryData.road_name}_${this.inventoryData.asset_type}_Inventory.pdf`;
        pdf.save(fileName);

        this.toastr.clear();
        this.toastr.success('PDF generated successfully!', 'Success', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
        this.toastr.clear();
        this.toastr.error('Failed to generate PDF', 'Error', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      });
  }
}
