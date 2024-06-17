import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlatocartaService {

  //apiUrl = 'https://8086-vallegrande-msrestauran-jr8yds39xxz.ws-us114.gitpod.io/api/v1/products/obtener';
  private apiUrl = 'https://8086-vallegrande-msrestauran-jr8yds39xxz.ws-us114.gitpod.io/api/v1/products/obtener';

  constructor(private http: HttpClient) { }

  getPlatosCarta(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  logPlatosCarta(): void {
    this.getPlatosCarta().subscribe(platos => console.log(platos));
  }

  getFilteredPlatos(searchTerm: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?search=${searchTerm}`);
  }
}
