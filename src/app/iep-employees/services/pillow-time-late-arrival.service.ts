import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PillowTimeLateArrivalService {

  private readonly BASE_URL: string = 'http://localhost:8080/employees';

 
   constructor(private http: HttpClient) {}
 
   configurarTiempo(request:number,idUser : number ): Observable<number> {
     return this.http.put<number>(this.BASE_URL+"/configLateArrival",{time : request, userId: idUser})
       .pipe(
         catchError((error: HttpErrorResponse) => {
           return throwError(() => error);
         })
       );
   }

   actualConfig(): Observable<number> {
    return this.http.get<number>(this.BASE_URL+"/configLateArrival")
   }
 
}
