import { Component } from '@angular/core';
import { ViewController, AlertController } from 'ionic-angular';
import {
  VehicleInterface
} from "../../providers/interfaces";
import {
  DataBaseProvider
} from "../../providers/providers";

@Component({
  selector: 'page-new-vehicle',
  templateUrl: 'new-vehicle.html',
})
export class NewVehiclePage {
  vehicle: VehicleInterface = {
    id: null,
    name: null,
    model: null,
    mileage: null,
    type: null,
  };
  loading_add: boolean = false;
  type_vehicle: string = "car";

  constructor(
    public viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private db: DataBaseProvider
  ) {
  }

  selectVehicle(vehicleType: string){
    this.vehicle.type = vehicleType;
  }

  resetType(){
    this.vehicle.type = null;
  }

  checkAndAlert(){
    if(this.vehicle.name == null || this.vehicle.name == ""){
      this.presentAlert('Opss, antes de continuar recuerda ponerle un nombre al vehículo','Este nombre te puede servir luego para reconocerlo, por eso es importante :)');
    }else if(this.vehicle.model == null || this.vehicle.model == ""){
      this.presentAlert('Opss, antes de continuar recuerda añadir el modelo del vehiculo (el año en que fue creado)','Este año te puede servir para reconocerlo de otros vehiculos con el mismo nombre :)');
    }else if(this.vehicle.type == null || this.vehicle.type == ""){
      this.presentAlert('Opss, antes de continuar recuerda seleccionar el tipo de vehículo','Este sirve para distinguirlo de forma más facíl, si no esta el tipo exacto de tu vehículo selecciona el mas similar');
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

  addVehicle(){
    this.loading_add = true;
    this.db.addVehicle(this.vehicle).then((vehicle)=>{
      //console.log('addition ok');
      this.loading_add = false;
      this.viewCtrl.dismiss();
    }).catch((error)=>{
      this.loading_add = false;
      this.presentAlert('Opss :(, algo paso al agregar el vehiculo y no se pudo continuar','Vamos a resolverlo :/, trata volviendo a intentarlo');
    });
  }

}
