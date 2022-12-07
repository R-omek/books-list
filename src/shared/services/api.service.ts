import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Keyable } from '../models/keyable';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiUrl: string = 'https://fakerestapi.azurewebsites.net'
  apiMethod: string = '/api/v1/Books'

  constructor(
    private http: HttpClient
  ) { }

  getBooks() {
    return this.http.get<object[]>(`${this.apiUrl}${this.apiMethod}`)
  } 

  updateBook(data: Keyable) {
    return this.http.put(`${this.apiUrl}${this.apiMethod}/${data['id']}`, data)
  }

  createBook(data: object, booksAmount: number) {
    const newData = {
      ...data,
      id: booksAmount + 1
    }
    return this.http.post(`${this.apiUrl}${this.apiMethod}`, newData)
  }
}
