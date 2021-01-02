import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-table2',
  templateUrl: './table2.component.html',
  styleUrls: ['./table2.component.css']
})

export class Table2Component implements OnInit {
  pager = {};
  pageOfItems = [];
  pagerlen=0;
  pages1=[]
  currentpage=0
  totalPages=0
  product_id=0
  constructor(
      private http: HttpClient,
      private route: ActivatedRoute
  ) { }
  

  ngOnInit() {
      // load page based on 'page' query param or default to 1
      //console.log( this.route.queryParams)
      this.route.queryParams.subscribe(x => 
        //console.log(x)
       this.loadPage(x.page || 1));
      }

      // ngOnInit() {
      //   this.route.queryParams.subscribe(params => {
      //     console.log(params)
      //    //this.product_id = params.get('id');
      //    this.loadPage(params.get('page') || 1);
      //   });
      // }

  private loadPage(page) {
      this.http.get<any>(`http://localhost:8080/api/items?page=${page}`).subscribe(x => {
        console.log( x.pager)
          this.pager = x.pager;
          this.pageOfItems = x.pageOfItems;
          this.pagerlen=x.pager.pages.length
         this.pages1=x.pager.pages
         this.currentpage=x.pagercurrentPage
         this.totalPages=x.totalPages
      });
  }
}


