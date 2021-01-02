import { Component, OnInit } from '@angular/core';
import{HttpClient} from '@angular/common/http';
import{Observable} from 'rxjs'

class Student {
  id: Number;
  name: String;
  EnrollmentNumber: Number;
  College: String;
  University: String;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  students: Student[] = [{
    id: 1,
    name: 'Krunal',
    EnrollmentNumber: 110470116021,
    College: 'VVP Engineering College',
    University: 'GTU'
},
{
    id: 2,
    name: 'Rushabh',
    EnrollmentNumber: 110470116023,
    College: 'VVP Engineering College',
    University: 'GTU'
},
];

  title = 'generate';
  constructor(private http:HttpClient){}
  ngOnInit(){
   this.http.get("https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=malaria&format=json").subscribe(json =>console.log(json))
   new Observable<string>(observer => {
    setInterval(() => observer.next(new Date().toString()), 1000);
  })
  }

  public getStudents(): any {
    const studentsObservable = new Observable(observer => {
           setTimeout(() => {
               observer.next(this.students);
           }, 1000);
    });

    return studentsObservable;
}

// getStudents().subscribe((studentsData: Student[]) => {
//             this.students = studentsData;
//    });
}
