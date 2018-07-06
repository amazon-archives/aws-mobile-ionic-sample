import { Injectable } from '@angular/core'

import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'

let eventsServiceFactory = () => { return new EventsService() }

export let EventsServiceProvider = {
  provide: EventsService,
  useFactory: eventsServiceFactory
}


@Injectable()
export class EventsService {
  private _userLoggedInSubject: Subject<boolean> = new Subject<boolean>();
  public userLogged : Observable<boolean> = this._userLoggedInSubject.asObservable();

  constructor() {}

  userLoggedId(){
    this._userLoggedInSubject.next(true);
  }
}
