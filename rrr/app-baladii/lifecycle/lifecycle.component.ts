import { Component, OnInit ,Input,OnChanges,SimpleChanges,DoCheck} from '@angular/core';
import {MyoneService} from '../myone.service'
import {Observable} from 'rxjs';

@Component({
  selector: 'app-lifecycle',
  templateUrl: './lifecycle.component.html',
  styleUrls: ['./lifecycle.component.css']
})
export class LifecycleComponent implements OnChanges,OnInit {
  @Input() lifecompo:string
  
 ngOnChanges(changes:SimpleChanges){
   const pre=changes['lifecompo'].previousValue
   const curr=changes['lifecompo'].currentValue
 }
  constructor(private service:MyoneService ) {}
  todaydate:any
  ngOnInit(): void {
    this.todaydate = this.service.getDate();
  

  const obs=new Observable((data)=>{
    data.next(1);
    data.next(2);
  }).subscribe(ele =>console.log(ele))
}
}
