import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts';
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../../road.service';
import { ApiUrl } from '../../../../../../shared/const';

@Component({
  selector: 'app-view-inventory',
  standalone: true,
  imports: [SharedModule, CommonModule, ShowcodeCardComponent, RouterLink],
  templateUrl: './view-inventory.component.html',
  styleUrl: './view-inventory.component.scss',
})
export class ViewInventoryComponent {
  prismCode = prismCodeData;
  inventoryId: any;
  inventoryData: any;
  urlLive = ApiUrl.API_URL_fOR_iMAGE;

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

  downloadImage(fieldName: string): void {
    const imageUrl = `${this.urlLive}/upload/inspection_images/${this.inventoryData[fieldName]}`;
    const anchor = document.createElement('a');
    anchor.href = imageUrl;
    anchor.download = ''; // Let the browser decide the file name
    anchor.target = '_blank'; // Optional: Open in a new tab if needed

    anchor.click();

    anchor.remove();
  }
}
