
import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/common/sharedmodule';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ShowcodeCardComponent } from '../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../shared/prismData/advancedUi/carousel';
@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [SharedModule,NgbCarouselModule, ShowcodeCardComponent],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent {
  prismCode = prismCodeData;
 images2=true;
 images=true;
 images3=true;
 images4=true;

 
 images5 = [
  
  {src:'./assets/images/media/media-26.jpg'},
  {src:'./assets/images/media/media-27.jpg'},
  {src:'./assets/images/media/media-33.jpg'},
];
images6 = [
  
  {src:'./assets/images/media/media-28.jpg'},
  {src:'./assets/images/media/media-31.jpg'},
  {src:'./assets/images/media/media-32.jpg'},
];
images7 = [
  
  {src:'./assets/images/media/media-43.jpg'},
  {src:'./assets/images/media/media-44.jpg'},
  {src:'./assets/images/media/media-45.jpg'},
];
images8 = [
  
  {src:'./assets/images/media/media-13.jpg'},
  {src:'./assets/images/media/media-14.jpg'},
  {src:'./assets/images/media/media-18.jpg'},
];
imagesIndicators = [
  './assets/images/media/road-1.jpg',
  './assets/images/media/road-2.jpg',
  './assets/images/media/bridge.jpg',
];
}