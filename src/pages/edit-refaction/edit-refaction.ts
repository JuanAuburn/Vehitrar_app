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
  selector: 'page-edit-refaction',
  templateUrl: 'edit-refaction.html',
})
export class EditRefactionPage {
  vehicle: VehicleInterface;
  refaction: RefactionInterface = {
    id: null,
    name: '',
    mileage: '',
    price: '',
    timestamp: null,
    description: ''
  };
  loading_set: boolean = false;

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
    console.log(this.vehicle);
    this.refaction = {
      id: this.navParams.get('refaction').id,
      name: this.navParams.get('refaction').name,
      mileage: this.navParams.get('refaction').mileage,
      price: this.navParams.get('refaction').price,
      timestamp: this.navParams.get('refaction').timestamp,
      description: this.navParams.get('refaction').description
    }
    console.log(this.refaction);
    this.dateNow = this.dateFunctions.getDateNowForInput();
    console.log("this.dateNow: "+this.dateNow);
    this.date = this.dateFunctions.getDateForInput(this.refaction.timestamp);
    console.log("this.date: "+this.date);
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

  updateDate(){
    this.refaction.timestamp = Date.parse(this.date);
  }

  close(){
    this.viewCtrl.dismiss();
  }

  setRefaction(){
    this.loading_set = true;
    this.db.editRefaction(this.vehicle, this.refaction).then((vehicle)=>{
      this.loading_set = false;
      console.log(vehicle);
      this.viewCtrl.dismiss();
    }).catch((error)=>{
      console.log(error);
      this.loading_set = false;
      this.presentAlert('Opss :(, algo paso y no se pudo continuar','Vamos a resolverlo :/, trata volviendo a intentarlo');
    });
  }

}
