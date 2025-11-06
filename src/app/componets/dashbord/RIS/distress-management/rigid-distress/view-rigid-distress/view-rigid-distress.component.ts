import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts';
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../../../manage-road/road.service';

@Component({
  selector: 'app-view-rigid-distress',
  standalone: true,
  imports: [SharedModule, CommonModule, ShowcodeCardComponent, RouterLink],
  templateUrl: './view-rigid-distress.component.html',
  styleUrl: './view-rigid-distress.component.scss',
})
export class ViewRigidDistressComponent {
  prismCode = prismCodeData;
  distressId: any;
  distressData: any;

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private roadService: RoadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.distressId = Number(params.get('id'));
      if (this.distressId) {
        this.loadDistressDetails(this.distressId);
      }
    });
  }

  loadDistressDetails(id: number): void {
    // Try to load from localStorage first
    const testRigidDistress = JSON.parse(
      localStorage.getItem('test_rigid_distress') || '[]'
    );
    const found = testRigidDistress.find(
      (d: any) => d.rigid_distress_id === id
    );

    if (found) {
      this.distressData = found;
      console.log(
        'Loaded rigid distress from localStorage:',
        this.distressData
      );
      this.toastr.success('Distress details loaded', 'Success', {
        timeOut: 2000,
        positionClass: 'toast-top-right',
      });
    } else {
      // Fallback to API if not found in localStorage
      this.roadService.geRigidDistressById(id).subscribe(
        (distress: any) => {
          console.log('get distress details from API', distress);
          if (distress && distress.data && distress.data.length > 0) {
            this.distressData = distress.data[0];
          }
        },
        (err: any) => {
          this.toastr.error('Failed to load distress details', 'Error', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      );
    }
  }
}
