import { Component } from '@angular/core'
import { NavController, NavParams, ViewController, Platform } from 'ionic-angular'
import { AuthService } from '../../app/auth.service'
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import {Storage} from '@ionic/storage';


declare var FB :any;

@Component({
  selector: 'modal-login',
  templateUrl: 'login.html'
})

export class LoginModal {

  page: string = 'login'
  credentials: Credentials = {}
  message: string
  error: string

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController, 
    public auth: AuthService,
    private facebook : Facebook,
    private platform : Platform,
    private storage : Storage) {}

  ionViewDidLoad() {
   }

  signin () {
    if(this.platform.is('cordova')){
          this.facebook.getLoginStatus().then((status)=>{
          if( status !== 'connected'){
              this.tryLoginWithStoragedToken().then((user) => {
                this.dismiss()
              }).catch(() =>{
                this.facebook.login(['email', 'public_profile']).then((response: FacebookLoginResponse) => {
                  this.storage.set('token',{'token' : response.authResponse.accessToken,
                   'expiresIn' : response.authResponse.expiresIn});
                  this.auth.facebookSignin(response.authResponse.accessToken).then((user) => {
                     this.dismiss()
                  }).catch((err) => {
                     console.log('error signing in', err)
                     this.setError(err.message)
                  });
              });
            });
          }else{
            this.tryLoginWithStoragedToken().then((user) => {
                   this.dismiss()
                }).catch((err) => {
                   console.log('error signing in', err)
                   this.setError(err.message)
                }); 
          }
    });
    }else{
      // this.auth.signin(this.credentials).then((user) => {
    //   this.dismiss()
    // }).catch((err) => {
    //   console.log('error signing in', err)
    //   this.setError(err.message)
    // });
    }
  }

  private tryLoginWithStoragedToken(){
    var _this = this;
    return new Promise(function(resolve,reject){
      _this.storage.get('token')
      .then((token) => {
        if( token === null )
          reject('token is not defined');
        _this.auth.facebookSignin(token).then((user) => {
                   resolve(user);
                }).catch((err) => {
                   reject(err);
                }); 
      }).catch((error) => {
        reject(error);
      })
    });
  }


  startFacebookOauth(){
    
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
