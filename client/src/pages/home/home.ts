import { Component } from '@angular/core'

import { NavController } from 'ionic-angular'
import { ModalController } from 'ionic-angular'

import { LoginModal } from '../../modal/login/login'
import { LogoutModal } from '../../modal/logout/logout'
import { AuthService } from '../../app/auth.service'

// import _ from 'lodash'
import * as _groupBy from 'lodash.groupby'
import * as _map from 'lodash.map'
import { List } from 'immutable'

import { IProject } from '../../app/project.interface'
import { ProjectStore } from '../../app/project.store'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public remainingTasks:number = 0

  public projectChartLabels:string[]
  public projectChartData:number[]
  public projectChartLegend:boolean = false
  public projectChartType:string = 'doughnut'

  public lineChartData:any[]
  public lineChartLabels:any[]
  public lineChartLegend:boolean = true
  public lineChartType:string = 'bar'
  public lineChartOptions:any = {
    responsive: true,
    scales: {
      yAxes: [
        { id: 'y-axis-1', type: 'linear', display: true, position: 'left', gridLines: { display: false } },
        { id: 'y-axis-2', type: 'linear', display: true, position: 'right', gridLines: { display: false } } ],
      xAxes: [{ gridLines: { display: false } }]
    }
  }

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public auth: AuthService,
    public store: ProjectStore) { }

  ionViewDidLoad() {this.store.projects.subscribe((projects) => this.createCharts(projects)) }

  doRefresh (refresher) {
    let subscription = this.store.refresh().subscribe({
      complete: () => {
        subscription.unsubscribe()
        refresher.complete()
      }
    })
  }

  public createCharts(projects:List<IProject>) {
     let _p = projects.toArray()
     this.lineChartLabels = null
     this.projectChartLabels = null
     this.createPieChart(_p)
     this.createBurnDownChart(_p)
  }

  private createBurnDownChart (projects:IProject[]) {
    if (projects.length === 0 && !this.lineChartLabels) { return this.lineChartLabels = null }

    let byMonths = _groupBy(projects, 'month')
    this.lineChartLabels = Object.keys(byMonths).sort()
    let burndown = this.lineChartLabels.map((k) => byMonths[k].reduce((sum, p) => {
      return sum + (p.added || 0) - (p.completed || 0)
    }, 0))
    for (let i = 0; i < burndown.length; i++) {
      burndown[i] += (burndown[i-1] || 0)
    }
    let completed = this.lineChartLabels.map((k) => byMonths[k].reduce((sum, p) => {
      return sum + (p.completed || 0)
    }, 0))

    let p = /\d{2}(\d{2})-(\d{2})/
    this.lineChartLabels = this.lineChartLabels.map( d => d.replace(p, (m,p1,p2) => p2 + '/' + p1) )

    this.lineChartData = [{ label: 'Completed', borderWidth: 1, type: 'bar', yAxisID: 'y-axis-1',
      data: completed
    }, { label: 'burndown', borderWidth: 1, type: 'line', yAxisID: 'y-axis-2',
    data: burndown
    }]
  }

  private createPieChart (projects:IProject[]) {
    if (projects.length === 0 && !this.projectChartLabels) { return this.projectChartLabels = null }

    let data = _map(_groupBy(projects, 'projectId'), (a) => a.reduce((res, p) => {
      res.total += (p.added || 0) - (p.completed || 0)
      return res
    },{name: a[0].projectId, total:0}))

    this.projectChartLabels = []
    this.projectChartData = []
    this.remainingTasks = 0

    data = data.filter((p) => p.total > 0)
    if (data.length === 0 ) { return this.projectChartLabels = null }
    data.forEach((p) => {
      this.projectChartLabels.push(p.name)
      this.projectChartData.push(p.total)
      this.remainingTasks += p.total
    })

  }

  openModal () {
    let modal = this.modalCtrl.create(this.auth.isUserSignedIn() ? LogoutModal : LoginModal)
    modal.present()
  }

  get userColor ():string {
    return this.auth.isUserSignedIn() ? 'secondary' : 'primary'
  }
}
