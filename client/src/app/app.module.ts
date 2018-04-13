import { NgModule, ErrorHandler } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { HttpModule } from '@angular/http'
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'
import { FormsModule } from '@angular/forms'

import { MyApp } from './app.component'

import { HomePage } from '../pages/home/home'
import { TabsPage } from '../pages/tabs/tabs'
import { LoginModal } from '../modal/login/login'
import { LogoutModal } from '../modal/logout/logout'
import { AddTaskModal } from '../modal/addtask/addtask'

import { AwsConfig } from './app.config'
import { AuthService, AuthServiceProvider } from './auth.service'
import { EventsService, EventsServiceProvider } from './events.service'
import { Sigv4Http, Sigv4HttpProvider } from './sigv4.service'

import { momentFromNowPipe } from './momentFromNow.pipe'

import { IonicStorageModule } from '@ionic/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AppEventsProvider } from '../providers/app-events/app-events';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TabsPage,
    LoginModal,
    LogoutModal,
    momentFromNowPipe
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp, new AwsConfig().load()),
    FormsModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    TabsPage,
    LoginModal,
    LogoutModal
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService, AuthServiceProvider,
    EventsService, EventsServiceProvider,
    Sigv4Http, Sigv4HttpProvider,
    InAppBrowser,
    AppEventsProvider
  ]
})
export class AppModule {}
