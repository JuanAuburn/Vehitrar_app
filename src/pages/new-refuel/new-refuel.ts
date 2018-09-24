import { Component } from '@angular/core';
import { ViewController, AlertController, NavParams } from 'ionic-angular';
import {
  VehicleInterface,
  RefuelInterface
} from "../../providers/interfaces";
import {
  DataBaseProvider,
  DateFunctions
} from "../../providers/providers";

@Component({
  selector: 'page-new-refuel',
  templateUrl: 'new-refuel.html',
})
export class NewRefuelPage {
  vehicle: VehicleInterface;
  refuel: RefuelInterface = {
    id: null,
    gallons: null,
    mileage: null,
    price: null,
    timestamp: null,
    gasolineType: 'corriente'
  };
  loading_add: boolean = false;

  date: string;
  dateNow: string;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private db: DataBaseProvider,
    private dateFunctions: DateFunctions
  ) {
    this.vehicle = this.navParams.get('vehicle');
    this.dateNow = this.dateFunctions.getDateNowForInput();
    this.date = this.dateNow;
    this.refuel.timestamp = Date.parse(this.date);
  }

  checkAndAlert(){
    this.refuel.timestamp = Date.parse(this.date);
    if(this.refuel.gallons == null || this.refuel.gallons == ""){
      this.presentAlert('Opss, antes de continuar recuerda digitar la cantidad de combustible que se reposto en Galones','Esto sirve para llevar un mejor control del consumo de tu vehículo');
    }else if(this.refuel.mileage == null || this.refuel.mileage == ""){
      this.presentAlert('Opss, antes de continuar recuerda ponerle el Kilometraje en que se reposto','Esto sirve para llevar un mejor control del consumo de tu vehículo');
    }else if(this.refuel.price == null || this.refuel.price == ""){
      this.presentAlert('Opss, antes de continuar recuerda añadir el del repostado','Este sirve para llevar un control de cuanto dinero estas gastando en combustible');
    }else if(this.refuel.timestamp == null || this.refuel.timestamp == 0){
      this.presentAlert('Opss, antes de continuar recuerda seleccionar la fecha del repostado','Este sirve para distinguirlo de otros repostados');
    }
  }

  presentAlert(title: string, subTitle: string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      buttons: ['Ok']
    });
    alert.present();
  }

  close(){
    this.viewCtrl.dismiss();
  }

  updateDate(){
    this.refuel.timestamp = Date.parse(this.date);
  }

  addRefuel(){
    this.loading_add = true;
    this.db.addRefuel(this.vehicle, this.refuel).then((vehicle)=>{
      this.loading_add = false;
      this.viewCtrl.dismiss();
    }).catch((error)=>{
      console.log(error);
      this.loading_add = false;
      this.presentAlert('Opss :(, algo paso y no se pudo continuar','Vamos a resolverlo :/, trata volviendo a intentarlo');
    });
  }

}
