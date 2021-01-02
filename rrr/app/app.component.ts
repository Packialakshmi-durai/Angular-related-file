import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {FormBuilder} from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title ="fileupload"
  images;
  name=""
  
  constructor(private http: HttpClient,private form: FormBuilder) { }
  ngOnInit(){}
  selectImage(event) {
    if(event.target.files.length>0){
      const file=event.target.files[0];
      console.log(file)
      this.images=file;
     this.name=file.name
    }
   }
  onSubmit() {
    const formData = new FormData();
    formData.append('file',this.images);
    this.http.post<any>('http://localhost:8080/file', formData).subscribe(
      (response) => {
        alert('File Uploaded Successfully')
      },
      (error) => {
        alert('Something Went Wrong !!!')
      }
    );
  }
  
  
}