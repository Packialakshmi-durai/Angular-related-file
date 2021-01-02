import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'balAdi';
  msg:boolean=true
  num:any="";
  do:string="";
  paisa:string="";
  debArray:any[]=[]
  crearray:any[]=[]
  call:string=""

  debit(){
    this.num =parseInt(this.num)-parseInt(this.paisa)
    this.debArray.push({"mainAmount":this.num,"debitedamount":this.paisa,"date":new Date()})
    this.msg=true
    this.call="debitonly"
   
  }
  
  credit(){
    this.num =parseInt(this.num)+parseInt(this.paisa)
    this.crearray.push({"mainAmount":this.num,"creamount":this.paisa,"date":new Date()})
    this.msg=true
    this.call="creonly"
  }

  all(){
    console.log(this.debArray)
    console.log(this.crearray)
  }

  spents(){
    console.log(this.debArray)
  }

  receive(){
    console.log(this.crearray)
  }

}
