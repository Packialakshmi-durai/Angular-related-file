import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser'
@Pipe({
  name: 'y'
})
export class YPipe implements PipeTransform {

  constructor(private sanitizer:DomSanitizer){}
  transform(value: string, city:string): any {
    return this.sanitizer.bypassSecurityTrustHtml( '<div style="background-color:red">'+city+'</div>')
  }

}
