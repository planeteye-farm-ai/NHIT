import { Component, ElementRef, OnInit, Renderer2,ViewChild } from '@angular/core';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rwfis-dashboard',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './rwfis-dashboard.component.html',
  styleUrl: './rwfis-dashboard.component.scss'
})
export class RwfisDashboardComponent {

  safeUrl: SafeResourceUrl | undefined;
  title:any;
  isLoading : boolean = true;
  @ViewChild('hide') hideIframe!:ElementRef;

  constructor(
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://app.powerbi.com/view?r=eyJrIjoiYmYzM2E5NWMtMWEyZi00N2E4LWJkZTQtNmVlN2YzYWJkNDlkIiwidCI6ImYwY2M0NzU1LWY3M2EtNGI3ZS1iMmRmLTM3YjY0N2M5NzNiNyJ9');
      this.hideloader();
  }
  hideloader() {
    setTimeout(() => {
      this.isLoading = false;
    }, 6000);
  }
}
