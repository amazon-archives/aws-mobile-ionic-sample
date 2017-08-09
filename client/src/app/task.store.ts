import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/concatAll'
import 'rxjs/add/operator/share'
import { List } from 'immutable'
import { ITask } from './task.interface'
import { AuthService } from './auth.service'
import * as moment from 'moment'
import * as _orderBy from 'lodash.orderby'
import { Sigv4Http } from './sigv4.service'
import { Config } from 'ionic-angular'

let taskStoreFactory = (sigv4: Sigv4Http, auth: AuthService, config: Config) => { return new TaskStore(sigv4, auth, config) }

export let TaskStoreProvider = {
  provide: TaskStore,
  useFactory: taskStoreFactory,
  deps: [Sigv4Http, AuthService]
}

const displayFormat = 'YYYY-MM-DD'

@Injectable()
export class TaskStore {

  private _tasks: BehaviorSubject<List<ITask>> = new BehaviorSubject(List([]))
  private endpoint:string

  constructor (private sigv4: Sigv4Http, private auth: AuthService, private config: Config) {
    this.endpoint = this.config.get('APIs')['TasksAPI']
    this.auth.signoutNotification.subscribe(() => this._tasks.next(List([])))
    this.auth.signinNotification.subscribe(() => this.refresh() )
    this.refresh()
  }

  get tasks () { return Observable.create( fn => this._tasks.subscribe(fn) ) }

  refresh () : Observable<any> {
    if (this.auth.isUserSignedIn()) {
      let observable = this.auth.getCredentials().map(creds => this.sigv4.get(this.endpoint, 'tasks', creds)).concatAll().share()
      observable.subscribe(resp => {
        console.log(resp)
        let data = resp.json()
        this._tasks.next(List(this.sort(data.tasks)))
      })
      return observable
    } else {
      this._tasks.next(List([]))
      return Observable.from([])
    }
  }

  addTask (task): Observable<ITask> {
    let observable = this.auth.getCredentials().map(creds => this.sigv4.post(this.endpoint, 'tasks', task, creds)).concatAll().share()

    observable.subscribe(resp => {
      if (resp.status === 200) {
        let tasks = this._tasks.getValue().toArray()
        let task = resp.json().task
        tasks.push(task)
        this._tasks.next(List(this.sort(tasks)))
      }
    })
    return observable.map(resp => resp.status === 200 ? resp.json().task : null)
  }

  deleteTask (index): Observable<ITask> {
    let tasks = this._tasks.getValue().toArray()
    let obs = this.auth.getCredentials().map(creds => this.sigv4.del(this.endpoint, `tasks/${tasks[index].taskId}`, creds)).concatAll().share()

    obs.subscribe(resp => {
      if (resp.status === 200) {
        tasks.splice(index, 1)[0]
        this._tasks.next(List(<ITask[]>tasks))
      }
    })
    return obs.map(resp => resp.status === 200 ? resp.json().task : null)
  }

  completeTask (index): Observable<ITask> {
    let tasks = this._tasks.getValue().toArray()
    let obs = this.auth.getCredentials().map(creds => this.sigv4.put(
      this.endpoint,
      `tasks/${tasks[index].taskId}`,
      {completed: true, completedOn: moment().format(displayFormat)},
      creds)).concatAll().share()

    obs.subscribe(resp => {
      if (resp.status === 200) {
        tasks[index] = resp.json().task
        this._tasks.next(List(this.sort(tasks)))
      }
    })

    return obs.map(resp => resp.status === 200 ? resp.json().task : null)
  }

  private sort (tasks:ITask[]): ITask[] {
    return _orderBy(tasks, ['completed', 'due'], ['asc', 'asc'])
  }
}
