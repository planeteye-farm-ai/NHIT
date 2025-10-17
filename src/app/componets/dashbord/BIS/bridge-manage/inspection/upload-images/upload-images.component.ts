import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import { BridgeService } from '../../bridge.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { ApiUrl } from '../../../../../../shared/const';
@Component({
  selector: 'app-upload-images',
  standalone: true,
  imports: [SharedModule,ShowcodeCardComponent],
  templateUrl: './upload-images.component.html',
  styleUrl: './upload-images.component.scss'
})
export class UploadImagesComponent {

  title:any;
  inspectionId:any;
  inspectionImages:any =[]
  imageUrls: File[] = [];
  imageUrl:any;
  imageOpen:any;
  urlLive = ApiUrl.API_URL_fOR_iMAGE;
  fileError: string | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef; 
constructor(private route: ActivatedRoute,
  private bridgeService:BridgeService,
  private toastr: ToastrService,
  private modalService: NgbModal) {}

ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    this.inspectionId = Number(params.get('id'));
  });

  this.getInspectionImages();
}

getInspectionImages(){
  this.bridgeService.getInspectionImage(this.inspectionId).subscribe((res)=>{
    // console.log(res);
    this.inspectionImages = res.data;
  })
}



onSelect(event: any): void {
  const fileList: FileList = event.target.files; // Access FileList
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg','image/webp','image/svg']; // Allowed file types
  let invalidFiles: File[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    if (!allowedTypes.includes(file.type)) {
      invalidFiles.push(file);
    } else {
      this.imageUrls.push(file); 
    }
  }

  if (invalidFiles.length > 0) {
    
    this.fileError = `Invalid files selected: ${invalidFiles
      .map((file) => file.name)
      .join(', ')}. Only .jpg, .jpeg, and .png are allowed.`;
      this.toastr.error(this.fileError, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
  } else {
    this.fileError = null; // Clear error if all files are valid
  }
}

// onSelect(event: any): void {
//   this.imageUrl = null;
//   const file = event.target.files[0];
//   const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg','image/webp','image/svg']; // Allowed file types
//   this.imageUrl = file
  
// }

save() {
  const formData = new FormData();
  formData.append('inspection_id', this.inspectionId.toString());

  this.imageUrls.forEach((image: File) => {
    formData.append('image[]', image); 
  });

  // console.log(this.imageUrls); 

  this.bridgeService.addInspectionImage(formData).subscribe(
    (res) => {
      if (res.status) {
        // this.ngOnInit();
        window.location.reload();
        this.toastr.success(res.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      } else {
        this.toastr.error(res.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
        this.fileInput.nativeElement.value = '';
      }
    },
    (err) => {
      this.toastr.error(err.msg || 'Something went wrong.', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });
}


openVerticallyCentered(content2:any,imageUrl:any) {
  this.imageOpen = imageUrl;
  this.modalService.open(content2, { size: 'lg' },);
}

deleteImage(imageId:any){
  // console.log("imageId",imageId)
  this.bridgeService.deleteImage(imageId).subscribe((res)=>{
 
    if(res.status){
      this.ngOnInit();
      this.toastr.success(res.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      this.fileInput.nativeElement.value = '';
    }
    else {
      this.toastr.error(res.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      this.fileInput.nativeElement.value = '';
    }
  },(err)=>{
    this.toastr.error(err.msg, 'NHAI RAMS', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
    });
  });
}

}
