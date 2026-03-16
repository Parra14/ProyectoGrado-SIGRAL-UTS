import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CaseService {

  private api = 'http://localhost:4000/api/cases';

  constructor(private http: HttpClient) {}

  /* ===============================
     DASHBOARD
  =============================== */

  getDashboardMetrics(params?: any) {
    return this.http.get<any>(`${this.api}/dashboard`, { params });
  }

  /* ===============================
     CASOS
  =============================== */

  getCases(params: any) {
    return this.http.get<any>(`${this.api}`, { params });
  }

  getCaseById(id: string) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  createCase(data: any) {
    return this.http.post(`${this.api}`, data);
  }

  updateCase(id: string, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  /* ===============================
     SEGUIMIENTO
  =============================== */

  addSeguimiento(
    id: string,
    message?: string,
    files?: File[]
  ) {

    const formData = new FormData();

    if (message) {
      formData.append('message', message);
    }

    if (files && files.length) {
      files.forEach(file => formData.append('file', file));
    }

    return this.http.post(`${this.api}/${id}/seguimiento`, formData);
  }

  /* ===============================
     CAMBIO DE ESTADO
  =============================== */

  advanceStatus(
    id: string,
    message: string,
    files?: File[]
  ) {

    const formData = new FormData();

    formData.append('message', message);

    if (files && files.length) {
      files.forEach(file => formData.append('file', file));
    }

    return this.http.patch(`${this.api}/${id}/status`, formData);
  }

  /* ===============================
     EXPORTES
  =============================== */

  exportCSV(params?:any){

    return this.http.get(
      `${this.api}/export/csv`,
      {
        params,
        responseType:'blob'
      }
    );

  }

  exportPDF(params?:any){

  return this.http.get(
      `http://localhost:4000/api/reports/cases/pdf`,
      {
        params,
        responseType:'blob'
      }
    );

  }

}