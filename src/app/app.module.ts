import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { GooglePlus } from '@ionic-native/google-plus';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { environment } from '../environments/environment';
import { firebase } from '@firebase/app';

import { MyApp } from './app.component';
import {
  HomePage,
  SingInPage,
  SingUpPage,
  MyProfilePage,
  AboutUsPage,
  NewVehiclePage,
  EditVehiclesPage,
  VehiclePage,
  ChangeOilPage,
  RefactionPage,
  RefuelPage,
  SoatTecPage,
  NewRefuelPage,
  EditRefuelPage,
  NewRefactionPage,
  EditRefactionPage
} from '../pages/pages';
import { AuthProvider } from '../providers/auth/auth';
import { DateFunctions } from '../providers/dateFunctions';
import { DataBaseProvider } from '../providers/data-base/data-base';
import { DataBaseRefactionProvider } from '../providers/data-base-refaction/data-base-refaction';
import { DataBaseRefuelProvider } from '../providers/data-base-refuel/data-base-refuel';

firebase.initializeApp(environment.firebaseConfig);

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SingInPage,
    SingUpPage,
    MyProfilePage,
    AboutUsPage,
    NewVehiclePage,
    EditVehiclesPage,
    VehiclePage,
    ChangeOilPage,
    RefactionPage,
    RefuelPage,
    SoatTecPage,
    NewRefuelPage,
    EditRefuelPage,
    NewRefactionPage,
    EditRefactionPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      backButtonText: ''
     }),
    AngularFireModule.initializeApp(environment.firebaseConfig, 'vehitrar'),
    AngularFireAuthModule,
    AngularFirestoreModule.enablePersistence()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SingInPage,
    SingUpPage,
    MyProfilePage,
    AboutUsPage,
    NewVehiclePage,
    EditVehiclesPage,
    VehiclePage,
    ChangeOilPage,
    RefactionPage,
    RefuelPage,
    SoatTecPage,
    NewRefuelPage,
    EditRefuelPage,
    NewRefactionPage,
    EditRefactionPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    GooglePlus,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    DateFunctions,
    DataBaseProvider,
    DataBaseRefuelProvider,
    DataBaseRefactionProvider,
  ]
})
export class AppModule {}
