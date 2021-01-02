import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import{ProductComponent} from './product/product.component'
import { SampleComponent } from './sample/sample.component';
import { EdituserComponent } from './edituser/edituser.component';
import { CardComponent } from './card/card.component';
import { LifecycleComponent } from './lifecycle/lifecycle.component';

const routes: Routes = [
{path:"product",component:ProductComponent},
{path:"sample",component:SampleComponent},
{path:"edituser",component:EdituserComponent},
{path:"card",component:CardComponent},
{path:"life",component:LifecycleComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
