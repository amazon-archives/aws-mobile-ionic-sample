import { Component } from '@angular/core'
import { NavController, NavParams, ViewController, Platform } from 'ionic-angular'
import { AuthService } from '../../app/auth.service'
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import {Storage} from '@ionic/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';


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
  facebook_login_error : boolean

  COGNITO_POOL_URL : string  = 'https://ioniclogin.auth.eu-west-1.amazoncognito.com'
  COGNITO_CLIENT_ID : string = '7no06cfnkftjbk3hpp1e9ti0rp'

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController, 
    public auth: AuthService,
    private facebook : Facebook,
    private platform : Platform,
    private storage : Storage,
    private browser : InAppBrowser,
    private http : Http) {}

  ionViewDidLoad() {
   }

  signin () {
      this.auth.signin(this.credentials).then((user) => {
      this.dismiss()
    }).catch((err) => {
      console.log('error signing in', err)
      this.setError(err.message)
    });
  }

  startFacebookOauth(){
    var login_page = this.browser.create( this.COGNITO_POOL_URL + '/login?response_type=code&client_id=' + this.COGNITO_CLIENT_ID + '&redirect_uri=http://localhost:8100/');
    login_page.on('loadstop').subscribe(event => {
      if(event.url.startsWith('http://localhost:8100')){
        var auth_code = event.url.split('code=')[1].split('#')[0];
        login_page.close();
        if(auth_code == null)
          this.facebook_login_error = true;
        else
          this.oauthRequestToken(auth_code);
    }
    });
  }

  oauthRequestToken(authorization_code){
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded' );
    let options = new RequestOptions({ headers: headers });
    let body = new URLSearchParams();
    body.set('grant_type','authorization_code');
    body.set('client_id',this.COGNITO_CLIENT_ID);
    body.set('redirect_uri','http://localhost:8100/' );
    body.set('code',authorization_code);
    let postParams = {
      grant_type: 'authorization_code',
      client_id: this.COGNITO_CLIENT_ID,
      redirect_uri: 'http://localhost:8100/',
      code : authorization_code
    }
    //postParams = [{"key":"grant_type","value":"authorization_code"},{"key":"client_id","value":this.COGNITO_CPLIENT_ID},{"key":"redirect_uri","value":"https://www.amazon.com"},{"key":"code","value":authorization_code}];
    this.http.post(this.COGNITO_POOL_URL + "/oauth2/token", body.toString(), options)
      .subscribe(data => {
        try{
          this.auth.setFacebookSession(data.json());
          this.dismiss();
          var __thus= this;
          setTimeout(function(){
            __thus.auth.getCredentials().subscribe(result => {
              console.log(result);
            });
          },60000);
        }catch(error){
          this.setError(error.toString());
        }
       }, error => {
        this.setError(error.text());
      });
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
