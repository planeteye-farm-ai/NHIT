import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pis-dashboard',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './pis-dashboard.component.html',
  styleUrl: './pis-dashboard.component.scss'
})
export class PisDashboardComponent {

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
      'https://app.powerbi.com/view?r=eyJrIjoiMDQ2NTA5MDYtMDEwMC00OGYyLTk4NjEtYWQ2NmE1N2VmNjQyIiwidCI6ImYwY2M0NzU1LWY3M2EtNGI3ZS1iMmRmLTM3YjY0N2M5NzNiNyJ9');
      this.hideloader();
  }

  hideloader() {
    setTimeout(() => {
      this.isLoading = false;
    }, 6000);
  }
}
