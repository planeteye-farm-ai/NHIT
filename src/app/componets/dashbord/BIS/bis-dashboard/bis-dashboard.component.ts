import { Component, ElementRef, OnInit, Renderer2,ViewChild } from '@angular/core';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bis-dashboard',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './bis-dashboard.component.html',
  styleUrl: './bis-dashboard.component.scss'
})
export class BisDashboardComponent {

  safeUrl: SafeResourceUrl | undefined;
  title:any;
  isLoading : boolean = true;
  @ViewChild('hide') hideIframe!:ElementRef;

  constructor(
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    // this.safeUrl = 'https://app.powerbi.com/view?r=eyJrIjoiMmMxOTAzZmItYmQzYS00NDkxLTk3MTktMDE3MjA2NmFmM2FjIiwidCI6ImYwY2M0NzU1LWY3M2EtNGI3ZS1iMmRmLTM3YjY0N2M5NzNiNyJ9'
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://app.powerbi.com/view?r=eyJrIjoiNzRiNjhiMmMtZDc4Yi00NGMwLWFjMDAtMTNlM2EwODRiYzIxIiwidCI6ImYwY2M0NzU1LWY3M2EtNGI3ZS1iMmRmLTM3YjY0N2M5NzNiNyJ9');
      this.hideloader();
  }
  hideloader() {
    setTimeout(() => {
      this.isLoading = false;
    }, 6000);
  }
}
