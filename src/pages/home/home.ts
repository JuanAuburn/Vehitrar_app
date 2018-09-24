import { Component } from '@angular/core';
import { NavController, ModalController, AlertController } from 'ionic-angular';
import {
  NewVehiclePage,
  EditVehiclesPage,
  VehiclePage
} from '../pages';
import {
  DataBaseProvider,
  VehicleInterface
} from '../../providers/providers';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  editOn: boolean = false;

  vehicles: VehicleInterface[]; // read collection

  constructor(
    private navCtrl: NavController,
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private db: DataBaseProvider
  ) {
    this.db.getVehicles().then((vehicles)=>{
      this.vehicles = vehicles;
    }).catch((error)=>{
      console.log(error);
    });
  }

  openVehicle(vehicle: VehicleInterface){
    if(this.editOn){
      this.editVehicle(vehicle);
    }else{
      this.navCtrl.push(VehiclePage, { vehicle: vehicle });
    }
  }

  editVehicle(vehicle: VehicleInterface){
    var modal = this.modalCtrl.create(EditVehiclesPage, { vehicle: vehicle });
    modal.present();
    modal.onDidDismiss(()=>{
      this.refresh();
    });
  }

  deleteVehicle(vehicle: VehicleInterface){
    this.alertCtrl.create({
      title: 'Realmente quieres eliminar el vehículo "'+vehicle.name+'"',
      message: 'requerda que se eliminara para siempre',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.db.deleteVehicle(vehicle).then(()=>{
              this.refresh();
            }).catch((error)=>{
              console.log(error);
            });
          }
        }
      ]
    }).present();
  }

  newVehicle(){
    var modal = this.modalCtrl.create(NewVehiclePage);
    modal.present();
    modal.onDidDismiss(()=>{
      this.refresh();
    });
  }

  editVehicles(){
    if(this.editOn){
      this.editOn = false;
    }else{
      this.editOn = true;
    }
  }

  refresh(){
    this.editOn = false;
    this.vehicles = null;
    this.db.getVehicles().then((vehicles)=>{
      this.vehicles = vehicles;
    }).catch((error)=>{
      console.log(error);
    });
  }

}
