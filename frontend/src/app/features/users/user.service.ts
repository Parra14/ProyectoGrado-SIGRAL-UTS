import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(paramsObj: any = {}) {
    let params: any = {};

    Object.keys(paramsObj).forEach(key => {
      if (paramsObj[key] !== null && paramsObj[key] !== '') {
        params[key] = paramsObj[key];
      }
    });

    return this.http.get<any>(this.api, { params });
  }
  toggleStatus(id: string) {
    return this.http.patch(`${this.api}/${id}/status`, {});
  }

  resetPassword(id: string, password: string) {
    return this.http.patch(`${this.api}/${id}/reset-password`, { password });
  }

  createUser(data: any) {
    return this.http.post(this.api, data);
  }

  updateUser(id: string, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }
}