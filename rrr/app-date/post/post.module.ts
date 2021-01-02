import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class PostModule {

  constructor(
    public body: string,
    public id: number,
    public title: string,
    public userId: number
  ) {}
 }
