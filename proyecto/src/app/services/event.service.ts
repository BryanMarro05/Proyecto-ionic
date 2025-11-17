import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private authChangeSubject = new Subject<boolean>();
  
  authChange$ = this.authChangeSubject.asObservable();

  publishAuthChange(isAuthenticated: boolean) {
    this.authChangeSubject.next(isAuthenticated);
  }
}