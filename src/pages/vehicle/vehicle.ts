import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import {
  VehicleInterface
} from '../../providers/providers';
import {
  ChangeOilPage,
  RefactionPage,
  RefuelPage,
  SoatTecPage
} from '../pages';

@Component({
  selector: 'page-vehicle',
  templateUrl: 'vehicle.html',
})
export class VehiclePage {
  vehicle: VehicleInterface;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController
  ) {
    this.vehicle = this.navParams.get('vehicle');
  }

  openRefuel(){
    this.navCtrl.push(RefuelPage, {vehicle: this.vehicle});
  }

  openRefaction(){
    this.navCtrl.push(RefactionPage, {vehicle: this.vehicle});
  }

  openChangeOil(){
    this.alertCtrl.create({
      title: "Esta función estara habilitada proximamente :D",
      subTitle: 'Tambien puedes revisar si hay nuevas actualizaciones de la app',
      buttons: ['OK']
    }).present();
    //this.navCtrl.push(ChangeOilPage, {vehicle: this.vehicle});
  }

  openSOATandTEC(){
    this.alertCtrl.create({
      title: "Esta función estara habilitada proximamente :D",
      subTitle: 'Tambien puedes revisar si hay nuevas actualizaciones de la app',
      buttons: ['OK']
    }).present();
    //this.navCtrl.push(SoatTecPage, {vehicle: this.vehicle});
  }

}
