import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  arr:any[]=[
    {
      CREATE_TS: "2018-08-15 17:28:30.0",
      Key1: "Val1",
      Key2: "Val2",
    },
    {
      CREATE_TS: "2018-08-15 17:17:30.0",
      Key1: "Val1",
      Key2: "Val2",
    },
    {
      CREATE_TS: "2018-08-15 17:25:30.0",
      Key1: "Val1",
      Key2: "Val2",
    }
  ]
  num:string=""

  n:boolean=false
  constructor() { }

  ngOnInit(): void {
  }
 
  but(){
    console.log(parseInt(this.num)+1)
   // this.arr.push({"debamnt":"18","bal":"10","reason":"eee","date":Date()})
   // this.arr.push({"creamnt":"20","bal":"10","reason":"eee"})
    this.n=true
    this.arr.sort((a,b) => a-b)
   // console.log( this.arr)
  console.log( this.sortData)
  
    
  }
  get sortData() {
    console.log("0000000000000000")
    return this.arr.sort((a, b) => {
      return <any>new Date(b.CREATE_TS) - <any>new Date(a.CREATE_TS);
    });
  }
}
