import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider, DataBaseProvider } from '../providers/providers';
import {
  HomePage,
  SingInPage,
  MyProfilePage,
  AboutUsPage
} from '../pages/pages';

import * as firebase  from 'firebase/app';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage:any;

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private menuCtrl: MenuController,
    private splashScreen: SplashScreen,
    private auth: AuthProvider,
    private db: DataBaseProvider,
    private afAuth: AngularFireAuth
  ) {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      let subscribe = this.afAuth.authState.subscribe((user)=>{
          if (user) {
            this.auth.setUser(user);
            this.db.init();
            this.rootPage = HomePage;
            this.menuCtrl.enable(true, "mycontent");
          }else{
            this.auth.setUser(null);
            this.rootPage = SingInPage;
            this.menuCtrl.enable(false, "mycontent");
          }
        },
        (error) => {
          this.auth.setUser(null);
          this.rootPage = SingInPage;
          this.menuCtrl.enable(false, "mycontent");
        }
      );
      this.auth.addSubscription('authState', subscribe);
      this.splashScreen.hide();
    });
  }

  home(){
    this.menuCtrl.close('mycontent');
    this.nav.setRoot(HomePage);
  }

  myProfile(){
    this.menuCtrl.close('mycontent');
    this.nav.setRoot(MyProfilePage);
  }

  aboutUs(){
    this.menuCtrl.close('mycontent');
    this.nav.setRoot(AboutUsPage);
  }

  logout(){
    this.menuCtrl.close('mycontent');
  	this.auth.logout();
    this.db.reset();
  	this.nav.setRoot(SingInPage);
  }
}
