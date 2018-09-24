import { Component } from '@angular/core';
import { ViewController, AlertController, NavParams } from 'ionic-angular';
import {
  VehicleInterface
} from "../../providers/interfaces";
import {
  DataBaseProvider
} from "../../providers/providers";

@Component({
  selector: 'page-edit-vehicles',
  templateUrl: 'edit-vehicles.html',
})
export class EditVehiclesPage {
  vehicle: VehicleInterface = {
    id: null,
    name: null,
    model: null,
    mileage: null,
    type: null,
  };
  loading_set: boolean = false;
  type_vehicle: string = "car";

  constructor(
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private db: DataBaseProvider
  ) {
    this.vehicle = {
      id: this.navParams.get('vehicle').id,
      name: this.navParams.get('vehicle').name,
      model: this.navParams.get('vehicle').model,
      mileage: this.navParams.get('vehicle').mileage,
      type: this.navParams.get('vehicle').type,
    };
    this.setType_Vehicle(this.vehicle.type);
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
    }else{
      this.setVehicle();
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

  setVehicle(){
    this.loading_set = true;
    this.db.editVehicle(this.vehicle).then((vehicle)=>{
      this.loading_set = false;
      this.viewCtrl.dismiss();
    }).catch((error)=>{
      this.loading_set = false;
      this.presentAlert('Opss :(, algo paso y no se pudo continuar','Vamos a resolverlo :/, trata volviendo a intentarlo');
    });
  }

  setType_Vehicle(vehicletype){
    if(  vehicletype=='Cross'
      || vehicletype=='DualSport'
      || vehicletype=='Standard'
      || vehicletype=='Scooter'
      || vehicletype=='Sport'
      || vehicletype=='Cruiser'
      || vehicletype=='Touring'
    ){
      this.type_vehicle = 'motorcycle';
    }
  }

}
