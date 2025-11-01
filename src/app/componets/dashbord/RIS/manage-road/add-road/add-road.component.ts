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
  selector: 'app-add-road',
  standalone: true,
  imports: [
    SharedModule,
    NgSelectModule,
    FormsModule,
    CommonModule,
    ShowcodeCardComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-road.component.html',
  styleUrl: './add-road.component.scss',
})
export class AddRoadComponent {
  roadForm!: FormGroup;
  prismCode = prismCodeData;

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

      // TESTING MODE: Store in localStorage
      // Get existing roads from localStorage
      let existingRoads = JSON.parse(
        localStorage.getItem('test_roads') || '[]'
      );

      // Generate a mock ID
      const mockId =
        existingRoads.length > 0
          ? Math.max(...existingRoads.map((r: any) => r.geometry_data_id)) + 1
          : 1;

      // Add ID to the road object
      const roadWithId = {
        geometry_data_id: mockId,
        ...bridgeObj,
      };

      // Add to existing roads
      existingRoads.push(roadWithId);

      // Save back to localStorage
      localStorage.setItem('test_roads', JSON.stringify(existingRoads));

      // Show success message
      this.toastr.success(
        `Road added successfully! ID: ${mockId}`,
        'NHAI RAMS (Test Mode)',
        {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        }
      );

      // Navigate to road list
      this.router.navigate(['/ris/road-manage/']);

      console.log('Road saved to localStorage:', roadWithId);
      console.log('All roads:', existingRoads);

      // PRODUCTION MODE: Uncomment below to use API
      // this.roadService.addRoad(bridgeObj).subscribe(
      //   (res) => {
      //     // console.log(res);
      //     if (res.status) {
      //       this.router.navigate(['/ris/road-manage/']);
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
}
