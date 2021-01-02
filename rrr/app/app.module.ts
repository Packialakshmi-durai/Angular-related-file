import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Table1Component } from './table1/table1.component';
import { Table2Component } from './table2/table2.component'
import { JwPaginationModule } from 'jw-angular-pagination';

//import {FormsModule,ReactiveFormsModule} from 'angular/forms';
@NgModule({
  declarations: [
    AppComponent,
    Table1Component,
    Table2Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    JwPaginationModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }


// https://www.thecodehubs.com/file-upload-with-node-js-api-and-angular-9/

// server only pending