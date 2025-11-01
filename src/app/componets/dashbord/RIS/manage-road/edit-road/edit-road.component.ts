import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/forms/form_layouts';
import { SharedModule } from '../../../../../shared/common/sharedmodule';
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
import { CustomValidators } from '../../../../../shared/common/custom-validators';
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../road.service';

@Component({
  selector: 'app-edit-road',
  standalone: true,
  imports: [
    SharedModule,
    NgSelectModule,
    FormsModule,
    CommonModule,
    ShowcodeCardComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-road.component.html',
  styleUrl: './edit-road.component.scss',
})
export class EditRoadComponent {
  roadForm!: FormGroup;
  prismCode = prismCodeData;
  roadId: any;
  roadData: any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService: RoadService,
    private router: Router
  ) {
    // this.roadForm = this.fb.group({
    //   inspectionItems: this.fb.array([]) // Create an empty FormArray
    // });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.roadId = Number(params.get('id'));
      if (this.roadId) {
        this.loadRoadDetails(this.roadId);
      }
    });

    this.roadForm = this.fb.group({
      name_of_road: [
        '',
        [Validators.required, CustomValidators.noWhitespaceValidator()],
      ],
      type_of_road: ['', Validators.required],
      length_of_road: [
        '',
        [Validators.required, CustomValidators.numberValidator()],
      ],
      carriage_way_lanes: ['', Validators.required],
    });
  }

  onSubmit(): void {
    // const formData: Suggestion = this.roadForm.value;
    // console.log('Form submitted:', formData);
    if (this.roadForm.invalid) {
      this.roadForm.markAllAsTouched();
      return;
    } else {
      let bridgeObj: any = {
        name_of_road: this.roadForm.get('name_of_road')?.value,
        type_of_road: this.roadForm.get('type_of_road')?.value,
        length_of_road: this.roadForm.get('length_of_road')?.value,
        carriage_way_lanes: this.roadForm.get('carriage_way_lanes')?.value,
      };

      // console.log("inspection form details",formData);

      // TESTING MODE: Update in localStorage
      let testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');
      const roadIndex = testRoads.findIndex(
        (r: any) => r.geometry_data_id === this.roadId
      );

      if (roadIndex !== -1) {
        // Update the road
        testRoads[roadIndex] = {
          geometry_data_id: this.roadId,
          ...bridgeObj,
        };

        // Save back to localStorage
        localStorage.setItem('test_roads', JSON.stringify(testRoads));

        // Reload the road details
        this.loadRoadDetails(this.roadId);

        this.toastr.success(
          'Road updated successfully!',
          'NHAI RAMS (Test Mode)',
          {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          }
        );

        console.log('Road updated in localStorage:', testRoads[roadIndex]);
      } else {
        // Not found in localStorage, use API
        this.toastr.warning(
          'Road not found in localStorage. Using API...',
          'NHAI RAMS',
          {
            timeOut: 2000,
            positionClass: 'toast-top-right',
          }
        );

        this.roadService.updateRoad(bridgeObj, this.roadId).subscribe(
          (res) => {
            // console.log(res);
            if (res.status) {
              this.loadRoadDetails(this.roadId);
              this.toastr.success(res.msg, 'NHAI RAMS', {
                timeOut: 3000,
                positionClass: 'toast-top-right',
              });
              // this.bridgeForm.reset();
            } else {
              this.toastr.error(res.msg, 'NHAI RAMS', {
                timeOut: 3000,
                positionClass: 'toast-top-right',
              });
            }
          },
          (err) => {
            this.toastr.error(err.msg, 'NHAI RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          }
        );
      }

      // PRODUCTION MODE: Uncomment below to use API
      // this.roadService.updateRoad(bridgeObj, this.roadId).subscribe(
      //   (res) => {
      //     // console.log(res);
      //     if (res.status) {
      //       this.loadRoadDetails(this.roadId);
      //       this.toastr.success(res.msg, 'NHAI RAMS', {
      //         timeOut: 3000,
      //         positionClass: 'toast-top-right',
      //       });
      //       // this.bridgeForm.reset();
      //     } else {
      //       this.toastr.error(res.msg, 'NHAI RAMS', {
      //         timeOut: 3000,
      //         positionClass: 'toast-top-right',
      //       });
      //     }
      //   },
      //   (err) => {
      //     this.toastr.error(err.msg, 'NHAI RAMS', {
      //       timeOut: 3000,
      //       positionClass: 'toast-top-right',
      //     });
      //   }
      // );
    }
  }

  loadRoadDetails(id: number): void {
    // TESTING MODE: Load from localStorage
    const testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');
    const foundRoad = testRoads.find((r: any) => r.geometry_data_id === id);

    if (foundRoad) {
      console.log('Road loaded from localStorage:', foundRoad);
      this.roadData = [foundRoad];
      this.patchValue({ data: [foundRoad] });
      this.toastr.info('Loaded from Test Mode (localStorage)', 'NHAI RAMS', {
        timeOut: 2000,
        positionClass: 'toast-top-right',
      });
    } else {
      this.toastr.warning(
        'Road not found in localStorage. Using API...',
        'NHAI RAMS',
        {
          timeOut: 2000,
          positionClass: 'toast-top-right',
        }
      );

      // Fallback to API if not found in localStorage
      this.roadService.getDetailsById(id).subscribe(
        (road: any) => {
          console.log('get road details', road);
          if (road) {
            this.roadData = road.data;
            this.patchValue(road);
          }
        },
        (err) => {
          this.toastr.error(err.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      );
    }
  }

  patchValue(road: any) {
    this.roadForm.patchValue({
      name_of_road: road.data[0].name_of_road,
      type_of_road: road.data[0].type_of_road,
      length_of_road: road.data[0].length_of_road,
      carriage_way_lanes: road.data[0].carriage_way_lanes,
    });
  }
}
