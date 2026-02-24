import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  private api = `${environment.apiUrl}/audit-logs`;

  constructor(private http: HttpClient) {}

  getAuditLogs(paramsObj: any) {
    let params = new HttpParams();

    Object.keys(paramsObj).forEach(key => {
      if (paramsObj[key]) {
        params = params.set(key, paramsObj[key]);
      }
    });

    return this.http.get<any>(this.api, { params });
  }

  exportCSV(paramsObj: any) {
    let params = new HttpParams();

    Object.keys(paramsObj).forEach(key => {
      if (paramsObj[key]) {
        params = params.set(key, paramsObj[key]);
      }
    });

    return this.http.get(`${this.api}/export`, {
      params,
      responseType: 'blob'
    });
  }
}