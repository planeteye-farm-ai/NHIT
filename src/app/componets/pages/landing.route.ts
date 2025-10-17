import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
export const land: Routes = [
    {path:'pages',children:[
        {
            path: 'landing',
            loadComponent: () =>
              import('./landing/landing.component').then((m) => m.LandingComponent),
          },
      
    ]
    }
]
@NgModule({
    imports: [RouterModule.forChild(land)],
    exports: [RouterModule],
  })
  export class landRoutingModule {
    static routes = land;
  }