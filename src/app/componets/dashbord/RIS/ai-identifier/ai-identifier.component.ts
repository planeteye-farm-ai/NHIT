import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-ai-identifier',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-identifier.component.html',
  styleUrl: './ai-identifier.component.scss',
})
export class AiIdentifierComponent {
  aiDistressUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    const url =
      'https://main-ai-road-distress-detection-1011198718454.us-west1.run.app';
    this.aiDistressUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
