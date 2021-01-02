import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.css']
})
export class SampleComponent implements OnInit {

  constructor() { }

  model:any={}
  msg:boolean=false
  a=[]
  public userName = '';
  public userPhone = '';

  nameEventHander($event: any) {
    this.userName = $event;
  }

  phoneEventHander($event: any) {
    this.userPhone = $event;
  }
  edit(){
    console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
  }
  delete(){
    
  }
  onSubmit(){

    this.a.push(this.model)
   this.model={}
    console.log(this.a)
    this.msg=true
  }
  
  ngOnInit(): void {
  }
 
}
