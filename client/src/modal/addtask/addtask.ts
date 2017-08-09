import { Component } from '@angular/core'
import { NavController, NavParams, ViewController } from 'ionic-angular'
import { AuthService } from '../../app/auth.service'
import { ITask } from '../../app/task.interface'
import { TaskStore } from '../../app/task.store'
import * as moment from 'moment'
import UUID from 'uuid'

@Component({
  selector: 'modal-addtask',
  templateUrl: 'addtask.html'
})
export class AddTaskModal {

  displayFormat:string = 'YYYY-MM-DD'
  task:ITask = {
    taskId: UUID.v4(),
    name: null,
    description: null,
    project: null,
    completed: false,
    due: moment().format(this.displayFormat)
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public auth: AuthService,
    private taskStore: TaskStore
  ) {}

  ionViewDidLoad() {}

  addTask () {
    this.task.project = this.task.project || 'N/A'
    this.task.createdOn = moment(new Date()).format(this.displayFormat)
    this.taskStore.addTask(this.task).subscribe(task => {
      if (task) {
        this.dismiss(task)
      } else {
        console.log('Could not add task. Please see logs')
      }
    })
  }

  dismiss (data?:any) { this.viewCtrl.dismiss(data) }
}
