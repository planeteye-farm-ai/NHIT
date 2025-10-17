import { Component, ElementRef, Renderer2 } from '@angular/core';
import { NavService } from '../../services/navservice';
import { Menu } from 'smart-webcomponents-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-layout',
  templateUrl: './customer-layout.component.html',
  styleUrl: './customer-layout.component.scss'
})
export class CustomerLayoutComponent {
  menuItems!:Menu[];
  menuitemsSubscribe$!:Subscription
  constructor(
    private navServices: NavService,
    private elementRef: ElementRef
  ) {}
  
  ngOnInit() {

    this.menuitemsSubscribe$ = this.navServices.items.subscribe((items: any) => {
      this.menuItems = items;
    });
  }

  clearNavDropdown() {
    this.menuItems?.forEach((a: any) => {
      a.active = false;
      a?.children?.forEach((b: any) => {
        b.active = false;
        b?.children?.forEach((c: any) => {
          c.active = false;
        });
      });
    });
  }
  clickOnBody() {
    document.querySelector('#responsive-overlay')?.classList.remove('active');
    let html = this.elementRef.nativeElement.ownerDocument.documentElement;
    if (window.innerWidth <= 992) {
      html?.setAttribute('data-toggled', html?.getAttribute('data-toggled') == 'close' ? 'close' : 'close');
    }
    html?.removeAttribute('data-icon-text');


    this.menuItem.active = !this.menuItem.active;

    if(html.getAttribute('data-nav-layout') =='horizontal' && window.innerWidth >= 992){this.clearNavDropdown();}
  }
  menuItem = {
    active: false,
  };

  ngOnDestroy() {
    this.menuitemsSubscribe$.unsubscribe();
  }
}

