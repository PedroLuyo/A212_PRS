import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlatocartaService {

  private apiUrl = 'https://8086-vallegrande-msrestauran-jr8yds39xxz.ws-us110.gitpod.io/api/v1/products/obtener/carta';

  constructor(private http: HttpClient) { }

  getPlatosCarta(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  logPlatosCarta(): void {
    this.getPlatosCarta().subscribe(platos => console.log(platos));
  }
}
