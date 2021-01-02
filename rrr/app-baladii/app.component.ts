import { Component } from '@angular/core';

export class user{
  public name:String
  public hobbies=[]
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'basic';
  hobbies=[
    {
      "user_id":"1",
      "firstname":"PACKIA",
      "lastname":"lakshmi",
      "DOB":"19/04/1996"
  }
]

}
