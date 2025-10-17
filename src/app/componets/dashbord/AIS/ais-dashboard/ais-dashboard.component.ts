import { Component, ElementRef, OnInit, Renderer2,ViewChild } from '@angular/core';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ais-dashboard',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './ais-dashboard.component.html',
  styleUrl: './ais-dashboard.component.scss'
})
export class AisDashboardComponent {

  safeUrl: SafeResourceUrl | undefined;
  title:any;
  isLoading : boolean = true;
  @ViewChild('hide') hideIframe!:ElementRef;

  constructor(
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://app.powerbi.com/view?r=eyJrIjoiYWYyOTdhZWUtMDEyMC00MDI2LWEzNDEtZDU0OGE5MTMzZWFhIiwidCI6ImYwY2M0NzU1LWY3M2EtNGI3ZS1iMmRmLTM3YjY0N2M5NzNiNyJ9 ');
      this.hideloader();
  }
  hideloader() {
    setTimeout(() => {
      this.isLoading = false;
    }, 6000);
  }

}
