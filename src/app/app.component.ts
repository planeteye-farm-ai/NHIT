import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { NgxEchartsModule } from 'ngx-echarts';
import { ColorPickerModule } from 'ngx-color-picker';
// import filepond module
import { FilePondModule } from 'ngx-filepond';
import { AppStateService } from './shared/services/app-state.service';
@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [FilePondModule, RouterOutlet, ToastrModule, NgxEchartsModule, ColorPickerModule]
})
export class AppComponent {
  title = 'udon';

  constructor(private appState : AppStateService){
    this.appState.updateState();
  }
}
