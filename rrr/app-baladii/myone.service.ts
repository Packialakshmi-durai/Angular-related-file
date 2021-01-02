import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MyoneService {

  constructor() { }
  getDate(){
    return new Date()
  }
}
