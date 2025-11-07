import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts';
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../../../manage-road/road.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-flexible-distress',
  standalone: true,
  imports: [
    SharedModule,
    NgSelectModule,
    FormsModule,
    CommonModule,
    ShowcodeCardComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './edit-flexible-distress.component.html',
  styleUrl: './edit-flexible-distress.component.scss',
})
export class EditFlexibleDistressComponent {
  distressForm!: FormGroup;
    prismCode = prismCodeData;
  distressId: any;
  distressData: any;

  directionOptions = ['Increasing (LHS)', 'Decreasing (RHS)', 'Median'];
  laneOptions = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];

  distressTypes = [
    'Bleeding or Fatty Surface',
    'Smooth Surface',
    'Streaking',
    'Hungry Surface',
    'Hairline Cracks',
    'Alligator & Map Cracking',
    'Longitudinal Cracking',
    'Transverse Cracks',
    'Edge Cracking',
    'Reflection Cracking',
    'Slippage',
    'Rutting',
    'Corrugation',
    'Shoving',
    'Shallow Depression',
    'Settlements and Upheaval',
    'Stripping',
    'Ravelling',
    'Potholes',
    'Edge Breaking',
  ];

    constructor(
      private route: ActivatedRoute,
      private fb: FormBuilder,
      private toastr: ToastrService,
    private roadService: RoadService,
      private router: Router,
    private http: HttpClient
    ) {}
    
    ngOnInit(): void {
      this.distressForm = this.fb.group({
      road_name: ['', Validators.required],
      chainage_start: [0, Validators.required],
      chainage_end: [0, Validators.required],
      direction: ['', Validators.required],
      carriage_way_lanes: ['', Validators.required],
      distress_type: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      numbers_distress: [0],
      dimension_length: [0],
      dimension_width: [0],
      dimension_depth: [0],
      distress_image: [''],
      distress_video: [''],
    });

    this.route.paramMap.subscribe((params) => {
        this.distressId = Number(params.get('id'));
        if (this.distressId) {
        this.loadDistressDetails(this.distressId);
      }
    });
  }

  loadDistressDetails(id: number): void {
    const testFlexibleDistress = JSON.parse(
      localStorage.getItem('test_flexible_distress') || '[]'
    );
    const found = testFlexibleDistress.find(
      (d: any) => d.flexible_distress_id === id
    );

    if (found) {
      this.distressData = found;
      console.log(
        'Loaded flexible distress from localStorage:',
        this.distressData
      );

      this.distressForm.patchValue({
        road_name: found.road_name,
        chainage_start: found.chainage_start,
        chainage_end: found.chainage_end,
        direction: found.direction,
        carriage_way_lanes: found.carriage_way_lanes,
        distress_type: found.distress_type,
        latitude: found.latitude,
        longitude: found.longitude,
        numbers_distress: found.numbers_distress,
        dimension_length: found.dimension_length,
        dimension_width: found.dimension_width,
        dimension_depth: found.dimension_depth,
        distress_image: found.distress_image,
        distress_video: found.distress_video,
      });

      this.toastr.success('Distress details loaded', 'Success', {
        timeOut: 2000,
              positionClass: 'toast-top-right',
            });
    } else {
      this.roadService.geFlexibleDistressById(id).subscribe(
        (distress: any) => {
          console.log('get distress details from API', distress);
          if (distress && distress.data && distress.data.length > 0) {
            this.distressData = distress.data[0];
            this.distressForm.patchValue(this.distressData);
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

  getDirectionLabel(direction: string): string {
    if (direction.includes('Increasing')) return 'Inc';
    if (direction.includes('Decreasing')) return 'Dec';
    if (direction.includes('Median')) return 'Med';
    return direction;
  }

  getDirectionForAPI(direction: string): string {
    if (direction.includes('Increasing')) return 'Increasing';
    if (direction.includes('Decreasing')) return 'Decreasing';
    if (direction.includes('Median')) return 'Median';
    return direction;
  }

  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
  }

  async submitToAPI(distressData: any): Promise<any> {
    const apiUrl = '/api/append_distressReported_excel/';

    const apiBody = {
      Latitude: distressData.latitude,
      Longitude: distressData.longitude,
      Chainage_Start: distressData.chainage_start,
      Chainage_End: distressData.chainage_end,
      Project_Name: distressData.road_name,
      Distress_Type: distressData.distress_type,
      Direction: this.getDirectionForAPI(distressData.direction),
      Date: this.getCurrentDate(),
      Length: distressData.dimension_length || 0,
      Carriage_Type: 'Flexible',
      Width: distressData.dimension_width || 0,
      Depth: distressData.dimension_depth || 0,
      Lane: distressData.carriage_way_lanes,
      No_of_Distress: distressData.numbers_distress || 0,
    };

    console.log('Updating flexible distress via API:', apiBody);
    return this.http.post(apiUrl, apiBody).toPromise();
  }

  async onSubmit(): Promise<void> {
    if (this.distressForm.invalid) {
      this.distressForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields', 'Validation Error');
      return;
    }

    this.toastr.info('Updating distress...', 'Please wait', {
      timeOut: 0,
      positionClass: 'toast-top-right',
    });

    const formValue = this.distressForm.value;

    let apiSuccess = false;
    try {
      await this.submitToAPI(formValue);
      apiSuccess = true;
      console.log('✅ API Update Success');
    } catch (error) {
      console.error('❌ API Update Failed:', error);
    }

    // Update in localStorage
    let testFlexibleDistress = JSON.parse(
      localStorage.getItem('test_flexible_distress') || '[]'
    );
    const index = testFlexibleDistress.findIndex(
      (d: any) => d.flexible_distress_id === this.distressId
    );

    if (index !== -1) {
      testFlexibleDistress[index] = {
        ...testFlexibleDistress[index],
        ...formValue,
        flexible_distress_id: this.distressId,
        geometry_data_id: this.distressData.geometry_data_id,
        carriage_type: 'Flexible',
        created_on: this.distressData.created_on,
      };
      localStorage.setItem(
        'test_flexible_distress',
        JSON.stringify(testFlexibleDistress)
      );
      console.log('✅ Updated in localStorage');
    }

    this.toastr.clear();

    if (apiSuccess) {
      this.toastr.success(
        'Flexible distress updated successfully!',
        'Success',
        {
            timeOut: 3000,
            positionClass: 'toast-top-right',
        }
      );

      setTimeout(() => {
        this.router.navigate(['/ris/road-manage/flexible-distress']);
      }, 500);
    } else {
      this.toastr.error(
        'Failed to update via API. Please try again.',
        'Error',
        {
          timeOut: 4000,
            positionClass: 'toast-top-right',
        }
      );
    }
  }
}
