export interface ITask {
  taskId?:string
  name:string
  due:string
  completed?:boolean
  project:string
  createdOn?:string
  completedOn?:string
  description?:string
}
