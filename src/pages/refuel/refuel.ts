import { Component } from '@angular/core';
import { NavParams, ModalController, AlertController } from 'ionic-angular';
import {
  NewRefuelPage,
  EditRefuelPage
} from '../pages';
import { environment } from "../../environments/environment";
import {
  DataBaseProvider,
  VehicleInterface,
  RefuelInterface,
  DateFunctions
} from '../../providers/providers';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-refuel',
  templateUrl: 'refuel.html',
})
export class RefuelPage {

  vehicle: VehicleInterface;
  editOn: boolean = false;
  refuels: RefuelInterface[] = []; // read collection

  ActiveStartDate: boolean = true;
  startDate: string;
  ActiveEndDate: boolean = false;
  endDate: string;

  gallonsSumary: number = 0;
  priceSumary: number = 0;
  mileageSumary: number = 0;
  mileageGallonsSumary: string = "0";

  ViewLoadMore: boolean = false;
  LoadMore: boolean = false;
  lastRefuelNumberElements: number = 0;
  lastFieldRefuel_timestamp: number = 0;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private navParams: NavParams,
    private db: DataBaseProvider,
    public dateFunctions: DateFunctions
  ) {
    this.vehicle = this.navParams.get('vehicle');
    this.db.getRefuels(this.vehicle).then((vehicle)=>{
      this.vehicle = vehicle;
      this.endDate = this.dateFunctions.getCompleteDateNowForInput();
      //console.log(Date.parse(this.endDate));
      var startDateTimestamp = Date.parse(this.endDate)-2629800000;
      //console.log(this.startDateTimestamp);
      this.startDate = this.dateFunctions.getCompleteDateForInput(startDateTimestamp);
      //console.log("startDate: "+this.startDate+", timestamp: "+this.endDateTimestamp+"\nendDate: "+this.endDate+", timestamp: "+this.startDateTimestamp);
      this.onChange();
    });
  }

  onChange(){
    console.log("onChange()");
    console.log('startDate: '+this.startDate);
    console.log('endDate: '+this.endDate);
    const timestampStart = new Date(this.startDate).getTime();
    const timestampEnd = new Date(this.endDate).getTime();
    const MinTimestampToSearch = new Date().getTime() - environment.pageSearchsToTimestampDiference;
    console.log("timestamp startDate: "+ timestampStart);
    console.log("MinTimestampToSearch: "+ MinTimestampToSearch);
    this.ViewLoadMore = false;
    this.LoadMore = false;
    if(timestampStart<MinTimestampToSearch){
      this.ViewLoadMore = true;
    }else if(!this.ActiveStartDate){
      this.ViewLoadMore = true;
    }
    this.lastRefuelNumberElements = this.vehicle.refuels.length;
    this.refuels = this.getRefuelsTimestamp();
    if(this.refuels.length == 0){
      if(this.ViewLoadMore = true){
        this.loadMore();
      }
    }
    if(this.refuels.length != 0){
      this.lastFieldRefuel_timestamp = this.refuels[this.refuels.length-1].timestamp;
    }

    this.summaryUpdate();
  }

  summaryUpdate(){
    this.gallonsSumary = 0;
    this.priceSumary = 0;
    this.mileageSumary = 0;
    this.mileageGallonsSumary = "0";
    var lastMileage = 0;
    var firstMileage = null;
    this.refuels.forEach((refuel: RefuelInterface)=>{
      this.gallonsSumary += parseFloat(refuel.gallons);
      this.priceSumary += parseInt(refuel.price);
      if(lastMileage < parseInt(refuel.mileage)){
        lastMileage = parseInt(refuel.mileage);
      }
      if(firstMileage){
        if(firstMileage > refuel.mileage){
          firstMileage = refuel.mileage;
        }
      }else{
        firstMileage = refuel.mileage;
      }
    });
    this.mileageGallonsSumary = this.promedioMileageGallons().toFixed(2);
    this.mileageSumary = lastMileage - firstMileage;
  }

  promedioMileageGallons(): number{
    var result = null;
    var gallonsTotal = 0;
    var distanceTotal = 0;
    for (let i = this.refuels.length-1; i > 0; i--) {
      var distance = parseInt(this.refuels[i-1].mileage) - parseInt(this.refuels[i].mileage);
      gallonsTotal += parseFloat(this.refuels[i].gallons);
      distanceTotal += distance;
    }
    if(gallonsTotal==0){
      return 0;
    }else{
      return result = Math.floor(distanceTotal/gallonsTotal);
    }
  }

  openRefuel(refuel: RefuelInterface){
    if(this.editOn){
      this.editRefuel(refuel);
    }else{
      console.log(refuel);
    }
  }

  editRefuel(refuel: RefuelInterface){
    let modal = this.modalCtrl.create(EditRefuelPage, { vehicle: this.vehicle, refuel: refuel });
    modal.onDidDismiss(() =>{
      console.log('editRefuel dismiss');
      console.log(this.vehicle);
      this.onChange();
    });
    modal.present();
  }

  deleteRefuel(refuel: RefuelInterface){
    this.alertCtrl.create({
      title: 'Realmente quieres eliminar el repopstado "price: '+refuel.price+', mileage: '+refuel.mileage+'"',
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
            this.db.deleteRefuel(this.vehicle, refuel).then(()=>{
              this.editOn = false;
              this.onChange();
            });
          }
        }
      ]
    }).present();
  }

  newRefuel(){
    this.ActiveEndDate = false;
    this.onChange();
    let modal = this.modalCtrl.create(NewRefuelPage, { vehicle: this.vehicle });
    modal.onDidDismiss(() =>{
      this.onChange();
    });
    modal.present();
  }

  editRefuels(){
    if(this.editOn){
      this.editOn = false;
    }else{
      this.editOn = true;
    }
  }

  getRefuelsTimestamp(): RefuelInterface[]{
    var response: RefuelInterface[] = [];
    if(this.ActiveStartDate && this.ActiveEndDate){
      console.log("ActiveStartDate and ActiveEndDate");
      const dateStart = this.startDate.split("-");
      const dateEnd = this.endDate.split("-");
      this.vehicle.refuels.forEach((refuel)=>{
        var major: boolean = false;
        var minor: boolean = true;
        const dateRefuel = this.dateFunctions.getCompleteDateForInput(refuel.timestamp).split("-");
        if(compareStartYear(dateRefuel, dateStart)){
          if(compareEndYear(dateRefuel, dateEnd)){
            response.push(refuel);
          }
        }
      });
    }else if(this.ActiveStartDate){
      console.log("Only ActiveStartDate");
      const dateStart = this.startDate.split("-");
      this.vehicle.refuels.forEach((refuel)=>{
        const dateRefuel = this.dateFunctions.getCompleteDateForInput(refuel.timestamp).split("-");
        if(compareStartYear(dateRefuel, dateStart)){
          response.push(refuel);
        }
      });
    }else if(this.ActiveEndDate){
      console.log("Only ActiveEndDate");
      const dateEnd = this.endDate.split("-");
      this.vehicle.refuels.forEach((refuel)=>{
        const dateRefuel = this.dateFunctions.getCompleteDateForInput(refuel.timestamp).split("-");
        if(compareEndYear(dateRefuel, dateEnd)){
          response.push(refuel);
        }
      });
    }else{
      console.log("Nothing");
      response = this.vehicle.refuels;
    }
    console.log(response);
    return response;
  }

  loadMore(){
    var timestampStart: number;
    var timestampEnd: number;
    if(this.ActiveStartDate){
      timestampStart = new Date(this.startDate).getTime();
    }
    if(this.ActiveEndDate){
      timestampEnd = new Date(this.endDate).getTime();
    }

    this.db.getRefuelsTimestamp(this.vehicle, timestampStart, timestampEnd, this.lastFieldRefuel_timestamp).then((vehicle)=>{
      this.LoadMore = false;
      if(this.lastRefuelNumberElements == vehicle.refuels.length){
        this.ViewLoadMore = false;
      }
      this.lastRefuelNumberElements = vehicle.refuels.length;
      this.vehicle = vehicle;
      this.refuels = this.getRefuelsTimestamp();
      this.lastFieldRefuel_timestamp = this.refuels[this.refuels.length-1].timestamp;
    }).catch((error)=>{
      console.log(error);
    });
  }
}

function compareStartYear(dateRefuel: string[], dateStart: string[]): boolean {
  if(parseInt(dateRefuel[0]) > parseInt(dateStart[0])){ // COMPARE START YEAR
    return true;
  }else if(parseInt(dateRefuel[0]) == parseInt(dateStart[0])){ // COMPARE START YEAR
    if(parseInt(dateRefuel[1]) > parseInt(dateStart[1])){ // COMPARE START MONTH
      return true;
    }else if(parseInt(dateRefuel[1]) == parseInt(dateStart[1])){ // COMPARE START MONTH
      if(parseInt(dateRefuel[2]) >= parseInt(dateStart[2])){ // COMPARE START DAY
        return true;
      }
    }
  }
  return false;
}

function compareEndYear(dateRefuel: string[], dateEnd: string[]): boolean {
  if(parseInt(dateRefuel[0]) < parseInt(dateEnd[0])){ // COMPARE END YEAR
    return true;
  }else if(parseInt(dateRefuel[0]) == parseInt(dateEnd[0])){ // COMPARE END YEAR
    if(parseInt(dateRefuel[1]) < parseInt(dateEnd[1])){ // COMPARE END MONTH
      return true;
    }else if(parseInt(dateRefuel[1]) == parseInt(dateEnd[1])){ // COMPARE END MONTH
      if(parseInt(dateRefuel[2]) <= parseInt(dateEnd[2])){ // COMPARE END DAY
        return true;
      }
    }
  }
  return false;
}
