import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [SharedModule, NgbTooltipModule, NgbDropdownModule, HttpClientModule],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {

  safeUrl: SafeResourceUrl | undefined;
  data_id: any;
  urlLive = 'https://logicalat.in/planeteye_admin/index.php';
  dataDetails: any;
  title:any;

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Subscribe to route parameter changes
    this.route.paramMap
      .pipe(
        switchMap(params => {
          // Get the 'id' from route params
          this.data_id = params.get('id');
          console.log(this.data_id);
          // Call the getDataDetails method whenever 'id' changes
          return this.getDataDetails1(this.data_id);
        })
      )
      .subscribe((res) => {
        if (res.status === true) {
          this.dataDetails = res.data[0];
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.dataDetails.description);
          this.title = this.dataDetails.title;
        }

        console.log('data details', this.dataDetails);
      });
  }
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log(token)
    return new HttpHeaders().set('Authorization', `${token}`);
  }

  getDataDetails1(dataId: any): Observable<any> {
    return this.http.get<any[]>(this.urlLive + `/api/user/data/get_data_by_id/${dataId}`, {
      headers: this.getHeaders()
    });
  }
}
