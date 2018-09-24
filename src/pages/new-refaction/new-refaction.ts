import { Component } from '@angular/core';
import { ViewController, AlertController, NavParams } from 'ionic-angular';
import {
  VehicleInterface,
  RefactionInterface
} from "../../providers/interfaces";
import {
  DataBaseProvider,
  DateFunctions
} from "../../providers/providers";

@Component({
  selector: 'page-new-refaction',
  templateUrl: 'new-refaction.html',
})
export class NewRefactionPage {
  vehicle: VehicleInterface;
  refaction: RefactionInterface = {
    id: null,
    name: null,
    mileage: null,
    price: null,
    timestamp: null,
    description: null
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
    this.refaction.timestamp = Date.parse(this.date);
  }

  checkAndAlert(){
    this.refaction.timestamp = Date.parse(this.date);
    if(this.refaction.name == null || this.refaction.name == ""){
      this.presentAlert('Opss, antes de continuar recuerda digitar el nombre del repuesto','Esto sirve para poder distinguirlo de otros repuestos');
    }else if(this.refaction.mileage == null || this.refaction.mileage == ""){
      this.presentAlert('Opss, antes de continuar recuerda ponerle el Kilometraje en que se puso el repuesto','Esto sirve para llevar un mejor control');
    }else if(this.refaction.price == null || this.refaction.price == ""){
      this.presentAlert('Opss, antes de continuar recuerda añadir el precio del reepuesto','Este sirve para llevar un control de cuanto dinero estas gastando en repuestos');
    }else if(this.refaction.timestamp == null || this.refaction.timestamp == 0){
      this.presentAlert('Opss, antes de continuar recuerda seleccionar la fecha del repuesto','Este sirve para distinguirlo de otros repuestos');
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
    this.refaction.timestamp = Date.parse(this.date);
  }

  addRefaction(){
    this.loading_add = true;
    this.db.addRefaction(this.vehicle, this.refaction).then((vehicle)=>{
      this.loading_add = false;
      this.viewCtrl.dismiss();
    }).catch((error)=>{
      console.log(error);
      this.loading_add = false;
      this.presentAlert('Opss :(, algo paso y no se pudo continuar','Vamos a resolverlo :/, trata volviendo a intentarlo');
    });
  }
}
