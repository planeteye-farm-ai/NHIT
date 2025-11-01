import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts';
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators';
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../../../manage-road/road.service';

@Component({
  selector: 'app-add-rigid-distress',
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
  templateUrl: './add-rigid-distress.component.html',
  styleUrl: './add-rigid-distress.component.scss',
})
export class AddRigidDistressComponent {
  distressForm!: FormGroup;
  prismCode = prismCodeData;
  geometryList: any;

  // Direction dropdown options
  directionOptions = ['Increasing', 'Decreasing', 'Median'];

  // Distress Type dropdown options
  distressTypeOptions = [
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
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService: RoadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.distressForm = this.fb.group({
      // Common fields
      geometry_data_id: ['', Validators.required],
      chainage_start: [
        '',
        [Validators.required, CustomValidators.numberValidator()],
      ],
      chainage_end: [
        '',
        [Validators.required, CustomValidators.numberValidator()],
      ],
      direction: ['', Validators.required],
      total_length: [
        '',
        [Validators.required, CustomValidators.numberValidator()],
      ],
      // Repeatable distress entries
      distressEntries: this.fb.array([this.createDistressEntry()]),
    });

    this.getGeometryList();
  }

  // Create a new distress entry FormGroup
  createDistressEntry(): FormGroup {
    return this.fb.group({
      carriage_way_lanes: ['', Validators.required],
      distress_type: ['', Validators.required],
      latitude: ['', [Validators.required, CustomValidators.numberValidator()]],
      longitude: [
        '',
        [Validators.required, CustomValidators.numberValidator()],
      ],
      numbers_distress: [''],
      dimension_length: ['', CustomValidators.numberValidator()],
      dimension_width: ['', CustomValidators.numberValidator()],
      dimension_depth: ['', CustomValidators.numberValidator()],
      distress_image: [''],
      distress_video: [''],
      image_file: [null],
      video_file: [null],
      image_preview: [null],
      video_preview: [null],
    });
  }

  // Get distress entries FormArray
  get distressEntries(): FormArray {
    return this.distressForm.get('distressEntries') as FormArray;
  }

  // Add new distress entry
  addDistressEntry(): void {
    this.distressEntries.push(this.createDistressEntry());
    this.toastr.info('New distress entry added', 'Info');
  }

  // Remove distress entry
  removeDistressEntry(index: number): void {
    if (this.distressEntries.length > 1) {
      this.distressEntries.removeAt(index);
      this.toastr.info('Distress entry removed', 'Info');
    } else {
      this.toastr.warning('At least one distress entry is required', 'Warning');
    }
  }

  getGeometryList() {
    // TESTING MODE: Load test roads from localStorage
    const testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');

    if (testRoads.length > 0) {
      // Format test roads for dropdown
      const formattedTestRoads = testRoads.map((road: any) => ({
        geometry_data_id: road.geometry_data_id,
        name_of_road: road.name_of_road + ' (Test)',
      }));

      // Try to get API data and merge
      this.roadService.getGeometryList().subscribe(
        (res) => {
          // Merge test roads with API roads (test roads first)
          this.geometryList = [...formattedTestRoads, ...(res.data || [])];
          console.log('Road dropdown (localStorage + API):', this.geometryList);

          if (formattedTestRoads.length > 0) {
            this.toastr.info(
              `${formattedTestRoads.length} test road(s) available in dropdown`,
              'NHAI RAMS',
              {
                timeOut: 2000,
                positionClass: 'toast-top-right',
              }
            );
          }
        },
        (err) => {
          // If API fails, just show test roads
          console.log('API failed, showing only localStorage roads');
          this.geometryList = formattedTestRoads;
        }
      );
    } else {
      // No test roads, load from API only
      this.roadService.getGeometryList().subscribe((res) => {
        this.geometryList = res.data;
        console.log(this.geometryList);
      });
    }
  }

  // Handle image file selection for specific entry
  onImageSelected(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        this.toastr.error(
          'Only JPG and PNG images are allowed',
          'Invalid File'
        );
        event.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('Image size should not exceed 5MB', 'File Too Large');
        event.target.value = '';
        return;
      }

      const entry = this.distressEntries.at(index) as FormGroup;
      entry.patchValue({
        distress_image: file.name,
        image_file: file,
      });

      const reader = new FileReader();
      reader.onload = (e: any) => {
        entry.patchValue({ image_preview: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle video file selection for specific entry
  onVideoSelected(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
      if (!validTypes.includes(file.type)) {
        this.toastr.error(
          'Only MP4, AVI, MOV, and WMV videos are allowed',
          'Invalid File'
        );
        event.target.value = '';
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        this.toastr.error(
          'Video size should not exceed 50MB',
          'File Too Large'
        );
        event.target.value = '';
        return;
      }

      const entry = this.distressEntries.at(index) as FormGroup;
      entry.patchValue({
        distress_video: file.name,
        video_file: file,
      });

      const reader = new FileReader();
      reader.onload = (e: any) => {
        entry.patchValue({ video_preview: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  // Remove image from specific entry
  removeImage(index: number): void {
    const entry = this.distressEntries.at(index) as FormGroup;
    entry.patchValue({
      distress_image: '',
      image_file: null,
      image_preview: null,
    });
  }

  // Remove video from specific entry
  removeVideo(index: number): void {
    const entry = this.distressEntries.at(index) as FormGroup;
    entry.patchValue({
      distress_video: '',
      video_file: null,
      video_preview: null,
    });
  }

  onSubmit(): void {
    if (this.distressForm.invalid) {
      this.distressForm.markAllAsTouched();
      this.toastr.error(
        'Please fill all required fields in all entries',
        'Validation Error'
      );
      return;
    }

    const formData = new FormData();

    // Add common fields
    formData.append('carriage_type', 'Rigid');
    formData.append(
      'geometry_data_id',
      this.distressForm.get('geometry_data_id')?.value
    );
    formData.append(
      'chainage_start',
      this.distressForm.get('chainage_start')?.value
    );
    formData.append(
      'chainage_end',
      this.distressForm.get('chainage_end')?.value
    );
    formData.append('direction', this.distressForm.get('direction')?.value);
    formData.append(
      'total_length',
      this.distressForm.get('total_length')?.value
    );

    // Add distress entries as JSON array
    const distressEntriesData: any[] = [];

    this.distressEntries.controls.forEach((entry, index) => {
      const entryData: any = {
        carriage_way_lanes: entry.get('carriage_way_lanes')?.value,
        distress_type: entry.get('distress_type')?.value,
        latitude: entry.get('latitude')?.value,
        longitude: entry.get('longitude')?.value,
        numbers_distress: entry.get('numbers_distress')?.value || '',
        dimension_length: entry.get('dimension_length')?.value || '',
        dimension_width: entry.get('dimension_width')?.value || '',
        dimension_depth: entry.get('dimension_depth')?.value || '',
      };

      distressEntriesData.push(entryData);

      const imageFile = entry.get('image_file')?.value;
      if (imageFile) {
        formData.append(`distress_image_${index}`, imageFile, imageFile.name);
      }

      const videoFile = entry.get('video_file')?.value;
      if (videoFile) {
        formData.append(`distress_video_${index}`, videoFile, videoFile.name);
      }
    });

    formData.append('distress_entries', JSON.stringify(distressEntriesData));
    formData.append('entries_count', this.distressEntries.length.toString());

    // TESTING MODE: Store in localStorage
    let existingRigidDistress = JSON.parse(
      localStorage.getItem('test_rigid_distress') || '[]'
    );

    // Generate a mock ID
    const mockId =
      existingRigidDistress.length > 0
        ? Math.max(
            ...existingRigidDistress.map((d: any) => d.rigid_distress_id)
          ) + 1
        : 1;

    // Create the rigid distress object
    const rigidDistressObj = {
      rigid_distress_id: mockId,
      carriage_type: 'Rigid',
      geometry_data_id: this.distressForm.get('geometry_data_id')?.value,
      chainage_start: this.distressForm.get('chainage_start')?.value,
      chainage_end: this.distressForm.get('chainage_end')?.value,
      direction: this.distressForm.get('direction')?.value,
      total_length: this.distressForm.get('total_length')?.value,
      entries_count: this.distressEntries.length,
      distress_entries: distressEntriesData,
      created_on: new Date().toISOString(),
    };

    // Add to existing distress records
    existingRigidDistress.push(rigidDistressObj);

    // Save back to localStorage
    localStorage.setItem(
      'test_rigid_distress',
      JSON.stringify(existingRigidDistress)
    );

    // Show success message
    this.toastr.success(
      `Rigid distress added successfully! ID: ${mockId} with ${this.distressEntries.length} entries`,
      'NHAI RAMS (Test Mode)',
      {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      }
    );

    // Navigate to rigid distress list
    this.router.navigate(['/ris/road-manage/rigid-distress']);

    // Log the JSON response
    console.log('=== RIGID DISTRESS JSON RESPONSE ===');
    console.log(JSON.stringify(rigidDistressObj, null, 2));
    console.log('All rigid distress records:', existingRigidDistress);

    // PRODUCTION MODE: Uncomment below to use API
    // console.log(
    //   'Submitting rigid distress data with',
    //   this.distressEntries.length,
    //   'entries...'
    // );
    //
    // this.roadService.addRigidDistress(formData).subscribe(
    //   (res) => {
    //     console.log(res);
    //     if (res.status) {
    //       this.router.navigate([
    //         '/ris/road-manage/edit-rigid-distress',
    //         res.rigid_distress_id,
    //       ]);
    //       this.toastr.success(
    //         res.msg ||
    //           `Rigid distress added successfully with ${this.distressEntries.length} entries`,
    //         'NHAI RAMS',
    //         {
    //           timeOut: 3000,
    //           positionClass: 'toast-top-right',
    //         }
    //       );
    //     } else {
    //       this.toastr.error(
    //         res.msg || 'Failed to add rigid distress',
    //         'NHAI RAMS',
    //         {
    //           timeOut: 3000,
    //           positionClass: 'toast-top-right',
    //         }
    //       );
    //     }
    //   },
    //   (err) => {
    //     this.toastr.error(err.msg || 'An error occurred', 'NHAI RAMS', {
    //       timeOut: 3000,
    //       positionClass: 'toast-top-right',
    //     });
    //   }
    // );
  }
}
