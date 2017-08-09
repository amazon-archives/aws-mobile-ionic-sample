import { Component } from '@angular/core'
import { NavController, NavParams, ViewController } from 'ionic-angular'
import { AuthService } from '../../app/auth.service'

@Component({
  selector: 'modal-login',
  templateUrl: 'login.html'
})
export class LoginModal {

  page: string = 'login'
  credentials: Credentials = {}
  message: string
  error: string

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public auth: AuthService) {}

  ionViewDidLoad() { }

  signin () {
    this.auth.signin(this.credentials).then((user) => {
      this.dismiss()
    }).catch((err) => {
      console.log('error signing in', err)
      this.setError(err.message)
    })
  }

  register () {
    this.auth.register(this.credentials).then((user) => {
      console.log('register: success', user)
      this.page = 'confirm'
    }).catch((err) => {
      console.log('error registering', err)
      this.setError(err.message)
    })
  }

  confirm () {
    this.auth.confirm(this.credentials).then((user) => {
      this.page = 'login'
      this.setMessage('You have been confirmed. Please sign in.')
    }).catch((err) => {
      console.log('error confirming', err)
      this.setError(err.message)
    })
  }

  private setMessage(msg) {
     this.message = msg
     this.error = null
  }

  private setError(msg) {
     this.error = msg
     this.message = null
  }

  dismiss () { this.viewCtrl.dismiss() }

  reset () { this.error = null; this.message = null; }

  showConfirmation () { this.page = 'confirm' }
}

interface Credentials {
  username?: string
  email?: string
  password?: string
  confcode?: string
}
