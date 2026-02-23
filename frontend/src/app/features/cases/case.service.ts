import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaseService {

  private api = 'http://localhost:4000/api/cases';

  constructor(private http: HttpClient) {}

  getDashboardMetrics(): Observable<any> {
    return this.http.get(`${this.api}/dashboard`);
  }

  getCases(params: any) {
    return this.http.get<any>(`${this.api}`, { params });
  }

  closeCase(id: string) {
    return this.http.patch(`${this.api}/${id}/close`, {});
  }

  createCase(data: any) {
    return this.http.post(this.api, data);
  }

  getCaseById(id: string) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  updateCase(id: string, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  addComment(id: string, message: string) {
    return this.http.post(`${this.api}/${id}/comment`, { message });
  }

  uploadEvidence(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.api}/${id}/evidence`, formData);
  }

}