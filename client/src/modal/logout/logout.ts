import { Component } from '@angular/core'
import { NavController, NavParams, ViewController } from 'ionic-angular'
import { AuthService } from '../../app/auth.service'
import { CognitoUser , CognitoUserAttribute } from 'amazon-cognito-identity-js'

@Component({
  selector: 'modal-logout',
  templateUrl: 'logout.html'
})
export class LogoutModal {

  user: CognitoUser
  attrs: Array<CognitoUserAttribute> = []

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public auth: AuthService) {}
  ionViewDidLoad() {
    this.auth.getCredentials().subscribe(creds => {
      this.auth.cognitoUser['getUserAttributes']((err, results) => {
        if (err) { return console.log('err getting attrs', err) }
        this.attrs = results
      })
    })
  }

  signout () {
     this.auth.signout()
     this.dismiss()
  }

  dismiss() { this.viewCtrl.dismiss() }
}
