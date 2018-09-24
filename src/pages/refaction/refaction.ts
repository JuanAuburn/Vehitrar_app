import { Component } from '@angular/core';
import { NavParams, ModalController, AlertController } from 'ionic-angular';
import {
  NewRefactionPage,
  EditRefactionPage
} from '../pages';
import { environment } from "../../environments/environment";
import {
  DataBaseProvider,
  VehicleInterface,
  RefactionInterface,
  DateFunctions
} from '../../providers/providers';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-refaction',
  templateUrl: 'refaction.html',
})
export class RefactionPage {

  vehicle: VehicleInterface;
  editOn: boolean = false;
  refactions: RefactionInterface[] = []; // read collection

  ActiveStartDate: boolean = true;
  startDate: string;
  ActiveEndDate: boolean = false;
  endDate: string;

  numberOfRefactions: number = 0;
  priceSumary: number = 0;

  ViewLoadMore: boolean = false;
  LoadMore: boolean = false;
  lastRefactionNumberElements: number = 0;
  lastFieldRefaction_timestamp: number = 0;

  searchBarValue: string = "";

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private navParams: NavParams,
    private db: DataBaseProvider,
    public dateFunctions: DateFunctions
  ) {
    this.vehicle = this.navParams.get('vehicle');
    this.db.getRefactions(this.vehicle).then((vehicle)=>{
      console.log(vehicle.refactions);
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
    this.lastRefactionNumberElements = this.vehicle.refactions.length;
    this.refactions = this.getRefactionsTimestamp();
    if(this.searchBarValue != ""){
      this.refactions = this.getRefactionsSearch();
    }
    if(this.refactions.length == 0){
      if(this.ViewLoadMore = true){
        this.loadMore();
      }
    }
    if(this.refactions.length != 0){
      this.lastFieldRefaction_timestamp = this.refactions[this.refactions.length-1].timestamp;
    }
    this.summaryUpdate();
  }

  summaryUpdate(){
    console.log("summaryUpdate()");
    this.numberOfRefactions = 0;
    this.priceSumary = 0;
    this.refactions.forEach((refaction: RefactionInterface)=>{
      this.numberOfRefactions++;
      this.priceSumary += parseInt(refaction.price);
    });
  }

  openRefaction(refaction: RefactionInterface){
    if(this.editOn){
      this.editRefaction(refaction);
    }else{
      console.log(refaction);
    }
  }

  editRefaction(refaction: RefactionInterface){
    let modal = this.modalCtrl.create(EditRefactionPage, { vehicle: this.vehicle, refaction: refaction });
    modal.onDidDismiss(() =>{
      console.log('editRefaction dismiss');
      console.log(this.vehicle);
      this.onChange();
    });
    modal.present();
  }

  deleteRefaction(refaction: RefactionInterface){
    this.alertCtrl.create({
      title: 'Realmente quieres eliminar el repopstado "price: '+refaction.price+', mileage: '+refaction.mileage+'"',
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
            this.db.deleteRefaction(this.vehicle, refaction).then(()=>{
              this.editOn = false;
              this.onChange();
            });
          }
        }
      ]
    }).present();
  }

  newRefaction(){
    this.ActiveEndDate = false;
    this.onChange();
    let modal = this.modalCtrl.create(NewRefactionPage, { vehicle: this.vehicle });
    modal.onDidDismiss(() =>{
      this.onChange();
    });
    modal.present();
  }

  editRefactions(){
    if(this.editOn){
      this.editOn = false;
    }else{
      this.editOn = true;
    }
  }

  getRefactionsTimestamp(): RefactionInterface[]{
    var response: RefactionInterface[] = [];
    if(this.ActiveStartDate && this.ActiveEndDate){
      console.log("ActiveStartDate and ActiveEndDate");
      const dateStart = this.startDate.split("-");
      const dateEnd = this.endDate.split("-");
      this.vehicle.refactions.forEach((refaction)=>{
        var major: boolean = false;
        var minor: boolean = true;
        const dateRefaction = this.dateFunctions.getCompleteDateForInput(refaction.timestamp).split("-");
        if(compareStartYear(dateRefaction, dateStart)){
          if(compareEndYear(dateRefaction, dateEnd)){
            response.push(refaction);
          }
        }
      });
    }else if(this.ActiveStartDate){
      console.log("Only ActiveStartDate");
      const dateStart = this.startDate.split("-");
      this.vehicle.refactions.forEach((refaction)=>{
        const dateRefaction = this.dateFunctions.getCompleteDateForInput(refaction.timestamp).split("-");
        if(compareStartYear(dateRefaction, dateStart)){
          response.push(refaction);
        }
      });
    }else if(this.ActiveEndDate){
      console.log("Only ActiveEndDate");
      const dateEnd = this.endDate.split("-");
      this.vehicle.refactions.forEach((refaction)=>{
        const dateRefaction = this.dateFunctions.getCompleteDateForInput(refaction.timestamp).split("-");
        if(compareEndYear(dateRefaction, dateEnd)){
          response.push(refaction);
        }
      });
    }else{
      console.log("Nothing");
      response = this.vehicle.refactions;
    }
    console.log(response);
    return response;
  }

  getRefactionsSearch(): RefactionInterface[]{
    console.log('search: '+this.searchBarValue);
    var response: RefactionInterface[] = this.vehicle.refactions;
    // if the value is an empty string don't filter the items
    if (this.searchBarValue != '') {
      response = response.filter((item) => {
        if(item.description){
          return ((item.name.toLowerCase().indexOf(this.searchBarValue.toLowerCase()) > -1) || (item.description.toLowerCase().indexOf(this.searchBarValue.toLowerCase()) > -1));
        }
        return (item.name.toLowerCase().indexOf(this.searchBarValue.toLowerCase()) > -1);
      });
    }
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

    this.db.getRefactionsTimestamp(this.vehicle, timestampStart, timestampEnd, this.lastFieldRefaction_timestamp).then((vehicle)=>{
      this.LoadMore = false;
      if(this.lastRefactionNumberElements == vehicle.refactions.length){
        this.ViewLoadMore = false;
      }
      this.lastRefactionNumberElements = vehicle.refactions.length;
      this.vehicle = vehicle;
      this.refactions = this.getRefactionsTimestamp();
      this.lastFieldRefaction_timestamp = this.refactions[this.refactions.length-1].timestamp;
    }).catch((error)=>{
      console.log(error);
    });
  }

  getItems(ev: any) {
    // set val to the value of the searchbar
    if(ev.target.value){
      this.searchBarValue = ev.target.value;
      this.refactions = this.getRefactionsSearch();
    }else{
      this.searchBarValue = '';
      this.refactions = this.getRefactionsSearch();
    }
  }

}

function compareStartYear(dateRefaction: string[], dateStart: string[]): boolean {
  if(parseInt(dateRefaction[0]) > parseInt(dateStart[0])){ // COMPARE START YEAR
    return true;
  }else if(parseInt(dateRefaction[0]) == parseInt(dateStart[0])){ // COMPARE START YEAR
    if(parseInt(dateRefaction[1]) > parseInt(dateStart[1])){ // COMPARE START MONTH
      return true;
    }else if(parseInt(dateRefaction[1]) == parseInt(dateStart[1])){ // COMPARE START MONTH
      if(parseInt(dateRefaction[2]) >= parseInt(dateStart[2])){ // COMPARE START DAY
        return true;
      }
    }
  }
  return false;
}

function compareEndYear(dateRefaction: string[], dateEnd: string[]): boolean {
  if(parseInt(dateRefaction[0]) < parseInt(dateEnd[0])){ // COMPARE END YEAR
    return true;
  }else if(parseInt(dateRefaction[0]) == parseInt(dateEnd[0])){ // COMPARE END YEAR
    if(parseInt(dateRefaction[1]) < parseInt(dateEnd[1])){ // COMPARE END MONTH
      return true;
    }else if(parseInt(dateRefaction[1]) == parseInt(dateEnd[1])){ // COMPARE END MONTH
      if(parseInt(dateRefaction[2]) <= parseInt(dateEnd[2])){ // COMPARE END DAY
        return true;
      }
    }
  }
  return false;
}
