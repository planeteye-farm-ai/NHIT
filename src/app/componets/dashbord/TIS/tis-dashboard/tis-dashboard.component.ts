import { Component, ElementRef, OnInit, Renderer2,ViewChild } from '@angular/core';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tis-dashboard',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './tis-dashboard.component.html',
  styleUrl: './tis-dashboard.component.scss'
})
export class TisDashboardComponent {

  safeUrl: SafeResourceUrl | undefined;
  title:any;
  isLoading : boolean = true;
  @ViewChild('hide') hideIframe!:ElementRef;

  constructor(
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://app.powerbi.com/view?r=eyJrIjoiMGI0YmE0OWQtY2M3Mi00ZGNlLWIzNmYtMDNkYzlkOGI1NDgxIiwidCI6ImYwY2M0NzU1LWY3M2EtNGI3ZS1iMmRmLTM3YjY0N2M5NzNiNyJ9');
      this.hideloader();
  }

  hideloader() {
    setTimeout(() => {
      this.isLoading = false;
    }, 6000);
  }
}
