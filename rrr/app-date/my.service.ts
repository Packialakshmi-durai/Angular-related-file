import { Injectable } from '@angular/core';
import{Observable} from'rxjs'
import {HttpClient} from '@angular/common/http'
import{PostModule} from'./post/post.module'

@Injectable({
  providedIn: 'root'
})
export class MyService {

  constructor(private http:HttpClient) { }
  private url: string = 'https://jsonplaceholder.typicode.com/posts';

  public getPost():Observable<PostModule[]>{
    return this.http.get<PostModule[]>(this.url);
  }
}
