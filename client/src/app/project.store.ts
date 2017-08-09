import { Injectable } from '@angular/core'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/concatAll'
import 'rxjs/add/operator/share'
import { List } from 'immutable'
import { IProject } from './project.interface'
import { Sigv4Http } from './sigv4.service'
import * as _keyBy from 'lodash.keyby'
import * as _values from 'lodash.values'
import { Config } from 'ionic-angular'
import { AuthService } from './auth.service'

let projectStoreFactory = (sigv4: Sigv4Http, auth: AuthService, config: Config) => { return new ProjectStore(sigv4, auth, config) }

export let ProjectStoreProvider = {
  provide: ProjectStore,
  useFactory: projectStoreFactory,
  deps: [Sigv4Http, AuthService]
}

@Injectable()
export class ProjectStore {

  private _projects: BehaviorSubject<List<IProject>> = new BehaviorSubject(List([]))
  private _projectsMap:{[id: string]: IProject}
  private endpoint:string

  constructor (private sigv4: Sigv4Http, private auth: AuthService, private config: Config) {
    this.endpoint = this.config.get('APIs')['ProjectsAPI']
    this.refresh()
  }

  get projects () { return Observable.create( fn => this._projects.subscribe(fn) ) }

  refresh () : Observable<any> {
    let observable =  this.auth.getCredentials().map(creds => this.sigv4.get(this.endpoint, 'projects', creds)).concatAll().share()
    observable.subscribe(resp => {
      let data = resp.json()
      this._projectsMap = _keyBy(data.projects, (p) => `${p.projectId}+${p.month}`)
      this._projects.next(List(<IProject[]>data.projects))
    })
    return observable
  }

  addTask (name, month, inc=true) {
    this.updateProject('added', name, month, inc)
    this.updateProjectList()
  }

  completeTask (name, month, inc=true) {
    this.updateProject('completed', name, month, inc)
    this.updateProjectList()
  }

  unCompleteTask (name, month) {
    this.completeTask (name, month, false)
  }

  deleteTask (name, monthAdded, monthCompleted) {
    this.updateProject('added', name, monthAdded, false)
    if (monthCompleted) {
      this.updateProject('completed', name, monthCompleted, false)
    }
    this.updateProjectList()
  }

  private updateProjectList () {
    this._projects.next(List(_values(this._projectsMap) as IProject[]))
  }

  private updateProject (action, name, month, inc) {
    let key = `${name}+${month}`
    let project = this._projectsMap[key]
    if (!project) {
      project = {
        projectId: name,
        month: month,
        added: 0,
        completed: 0,
      }
      this._projectsMap[key] = project
    }
    project[action] = project[action] + (inc ? 1 : -1)
  }
}
