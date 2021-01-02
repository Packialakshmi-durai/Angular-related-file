import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { YPipe } from './y.pipe';
import { ProductComponent } from './product/product.component';
import { SampleComponent } from './sample/sample.component';
import { EdituserComponent } from './edituser/edituser.component';
import { CardComponent } from './card/card.component';
import { LifecycleComponent } from './lifecycle/lifecycle.component';
import{MyoneService} from './myone.service'

@NgModule({
  declarations: [
    AppComponent,
    YPipe,
    ProductComponent,
    SampleComponent,
    EdituserComponent,
    CardComponent,
    LifecycleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [MyoneService],
  bootstrap: [AppComponent]
})
export class AppModule { }
