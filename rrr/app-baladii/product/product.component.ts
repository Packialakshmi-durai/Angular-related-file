import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import{ ActivatedRoute} from '@angular/router'

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnChanges {

  
  ngOnChanges(changes: SimpleChanges) {
    // Insert Logic Here!
}

   constructor(private activateRoute:ActivatedRoute) {
    this.activateRoute.queryParams.subscribe(data =>{
      console.log(data)
    })
   }

  ngOnInit(): void {
  }

}
