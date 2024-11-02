import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersMockIdService {

  constructor() { }

  getMockId(): number {
    return 1;
  }
}
