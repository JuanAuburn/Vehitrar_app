import { Injectable } from '@angular/core';
import {
  AuthProvider,
  DataBaseRefuelProvider,
  DataBaseRefactionProvider,
  VehicleInterface,
  RefuelInterface,
  RefactionInterface,
  ChangeOilInterface,
  SoatTecInterface
} from '../../providers/providers';
import { environment } from "../../environments/environment";
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import 'rxjs/add/operator/map';

@Injectable()
export class DataBaseProvider {

  uid: string;

  vehiclesCollection: AngularFirestoreCollection<VehicleInterface>;
  public vehicles: VehicleInterface[];

  dbRefuel: DataBaseRefuelProvider;
  dbRefaction: DataBaseRefactionProvider;

  constructor(
    private afs: AngularFirestore,
    private auth: AuthProvider
  ) {
    this.dbRefuel = new DataBaseRefuelProvider();
    this.dbRefaction = new DataBaseRefactionProvider();
  }

  init(){
    this.uid = this.auth.getUserId();
    this.vehiclesCollection = this.afs.collection('usuarios/'+this.uid+'/vehicles');
    this.vehicles = [];
    this.dbRefuel.init(this);
    this.dbRefaction.init(this);
  }

  reset(){
    this.uid = null;
    this.vehiclesCollection = null;
    this.vehicles = null;
  }

  getLocalVehicle(vehicleId: string): VehicleInterface{
    this.vehicles.forEach(vehicle=>{
      if(vehicleId == vehicle.id){
        return vehicle;
      }
    });
    return;
  }
  setLocalVehicle(vehicle: VehicleInterface){
    for (let i = 0; i < this.vehicles.length; i++) {
      if(this.vehicles[i].id == vehicle.id){
        this.vehicles[i] = vehicle;
      }
    }
  }
  deleteLocalVehicle(vehicleId: string){
    for (let i = 0; i < this.vehicles.length; i++) {
      if(this.vehicles[i].id == vehicleId){
        this.vehicles.splice(i, 1);
      }
    }
  }

  // --------------------- Vehicle Functions ---------------------

  getVehicles(): Promise<VehicleInterface[]>{
    console.log("getVehicles()");
    if(!this.uid){
      this.init();
    }
    return new Promise((resolve, reject) => {
      var subscribe = this.vehiclesCollection.snapshotChanges().map((resp: any)=> {
        var data: VehicleInterface[] = [];
        resp.forEach((element)=>{
          var dataElement = element.payload.doc.data();
          dataElement.id = element.payload.doc.id;
          data.push(dataElement);
        });
        return data;
      }).subscribe((vehicles)=>{
        this.vehicles = vehicles;
        resolve(this.vehicles);
        subscribe.unsubscribe();
        subscribe.remove(subscribe);
      }, (error)=>{
        reject(error);
      });
    });
  }

  addVehicle(vehicle: VehicleInterface): Promise<VehicleInterface>{
    console.log("addVehicle()");
    return new Promise((resolve, reject) => {
      if(!vehicle.id || vehicle.id == ""){
        vehicle.id = this.getIdtoVehicle();
      }
      this.vehicles.unshift(vehicle);
      var timeout = setTimeout(()=>{
          console.log('timeOut');
          resolve(vehicle);
        }, environment.timeOutToService
      );
      this.vehiclesCollection.doc(vehicle.id).set(vehicle).then(()=>{
        clearTimeout(timeout);
        resolve(vehicle);
      }).catch((error)=>{
        for (let i = 0; i < this.vehicles.length; i++) {
          if(this.vehicles[i].id == vehicle.id){
            this.vehicles.splice(i, 1);
          }
        }
        reject(error);
      });
    });
  }

  editVehicle(vehicle: VehicleInterface): Promise<VehicleInterface>{
    console.log("editVehicle()");
    var vehicleToEdit = {
      id: vehicle.id,
      name: vehicle.name,
      model: vehicle.model,
      mileage: vehicle.mileage,
      type: vehicle.type
    }
    return new Promise((resolve, reject) => {
      this.setLocalVehicle(vehicle);
      var timeout = setTimeout(()=>{
          console.log('timeOut');
          resolve(vehicle);
        }, environment.timeOutToService
      );
      this.vehiclesCollection.doc(vehicle.id).update(vehicleToEdit).then(()=>{
        clearTimeout(timeout);
        resolve(vehicle);
      }).catch((error)=>{
        reject(error);
      });
    });
  }

  deleteVehicle(vehicle: VehicleInterface): Promise<void>{
    console.log("deleteVehicle()");
    return new Promise((resolve, reject) => {
      this.deleteLocalVehicle(vehicle.id);
      var timeout = setTimeout(()=>{
          console.log('timeOut');
          resolve();
        }, environment.timeOutToService
      );
      this.vehiclesCollection.doc(vehicle.id).delete().then(()=>{
        clearTimeout(timeout);
        resolve();
      }).catch((error)=>{
        reject(error);
      });
    });
  }

  // --------------------- Refuel Functions ---------------------
  getRefuelsTimestamp(vehicle: VehicleInterface, timestampStart?: number, timestampEnd?: number, lastFieldRefuel_timestamp?: number): Promise<VehicleInterface>{
    return this.dbRefuel.getRefuelsTimestamp(vehicle, timestampStart, timestampEnd, lastFieldRefuel_timestamp);
  }

  getRefuels(vehicle: VehicleInterface): Promise<VehicleInterface>{
    return this.dbRefuel.getRefuels(vehicle);
  }

  addRefuel(vehicle: VehicleInterface, refuel: RefuelInterface): Promise<VehicleInterface>{
    return this.dbRefuel.addRefuel(vehicle, refuel);
  }

  editRefuel(vehicle: VehicleInterface, refuel: RefuelInterface): Promise<VehicleInterface>{
    return this.dbRefuel.editRefuel(vehicle, refuel);
  }

  deleteRefuel(vehicle: VehicleInterface, refuel: RefuelInterface): Promise<void>{
    return this.dbRefuel.deleteRefuel(vehicle, refuel);
  }

  // --------------------- Refaction Functions ---------------------

  getRefactionsTimestamp(vehicle: VehicleInterface, timestampStart?: number, timestampEnd?: number, lastFieldRefaction_timestamp?: number): Promise<VehicleInterface>{
    return this.dbRefaction.getRefactionsTimestamp(vehicle, timestampStart, timestampEnd, lastFieldRefaction_timestamp);
  }

  getRefactions(vehicle: VehicleInterface): Promise<VehicleInterface>{
    return this.dbRefaction.getRefactions(vehicle);
  }

  addRefaction(vehicle: VehicleInterface, refaction: RefactionInterface): Promise<VehicleInterface>{
    return this.dbRefaction.addRefaction(vehicle, refaction);
  }

  editRefaction(vehicle: VehicleInterface, refaction: RefactionInterface): Promise<VehicleInterface>{
    return this.dbRefaction.editRefaction(vehicle, refaction);
  }

  deleteRefaction(vehicle: VehicleInterface, refaction: RefactionInterface): Promise<void>{
    return this.dbRefaction.deleteRefaction(vehicle, refaction);
  }

  // --------------------- ChangeOil Functions ---------------------

  getChangeOils(): Promise<ChangeOilInterface[]>{
    return new Promise((resolve, reject) => {
    });
  }

  addChangeOil(): Promise<ChangeOilInterface>{
    return new Promise((resolve, reject) => {
    });
  }

  editChangeOil(): Promise<ChangeOilInterface>{
    return new Promise((resolve, reject) => {
    });
  }

  deleteChangeOil(): Promise<void>{
    return new Promise((resolve, reject) => {
    });
  }

  // --------------------- SoatTec Functions ---------------------

  getSoatTecs(): Promise<SoatTecInterface[]>{
    return new Promise((resolve, reject) => {
    });
  }

  addSoatTec(): Promise<SoatTecInterface>{
    return new Promise((resolve, reject) => {
    });
  }

  editSoatTec(): Promise<SoatTecInterface>{
    return new Promise((resolve, reject) => {
    });
  }

  deleteSoatTec(): Promise<void>{
    return new Promise((resolve, reject) => {
    });
  }

  // --------------------- Others Functions ---------------------

  getAleatoryId(): string{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 10; i++){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  getIdtoVehicle(): string{
    var finish = false;
    var id = "";
    while(!finish){
      finish = true;
      id = this.getAleatoryId();
      this.vehicles.forEach(vehicle =>{
        if(vehicle.id == id){
          finish = false;
        }
      });
    }
    return id;
  }

  getIdtoRefuel(vehicle: VehicleInterface): string{
    var finish = false;
    var id = "";
    while(!finish){
      finish = true;
      id = this.getAleatoryId();
      vehicle.refuels.forEach(refuel =>{
        if(refuel.id == id){
          finish = false;
        }
      });
    }
    return id;
  }

  getLastMileage(vehicle: VehicleInterface, exceptId?: string): string{
    var mileage: string = "0";
    // search in refuel the most higher mileage of the vehicle
    if(vehicle.refuels){
      vehicle.refuels.forEach(refuel=>{
        if(refuel.id != exceptId){
          if(parseInt(mileage) < parseInt(refuel.mileage)){
            mileage = refuel.mileage;
          }
        }
      });
    }
    if(vehicle.refactions){
      vehicle.refactions.forEach(refaction=>{
        if(refaction.id != exceptId){
          if(parseInt(mileage) < parseInt(refaction.mileage)){
            mileage = refaction.mileage;
          }
        }
      });
    }
    return mileage;
  }

  setVehicleMileage(vehicle: VehicleInterface, newMileage: string, previousMileage?: string, elementId?: string){
    console.log("setVehicleMileage(vehicle, newMileage:"+newMileage+", previousMileage:"+previousMileage+", elementId:"+elementId+")");
    if(vehicle.mileage != newMileage){
      console.log("vehicle.mileage != newMileage");
      if(parseInt(vehicle.mileage) < parseInt(newMileage)){
        console.log("vehicle.mileage < newMileage");
        vehicle.mileage = newMileage;
        this.setLocalVehicle(vehicle);
        this.editVehicle(vehicle);
      }else{
        if(previousMileage){
          if(vehicle.mileage == previousMileage){
            console.log("vehicle.mileage == previousMileage");
            const mileage = this.getLastMileage(vehicle, elementId);
            console.log("lastMileage: "+mileage);
            if(mileage != '0'){
              if(parseInt(mileage) < parseInt(newMileage)){
                console.log("mileage < newMileage");
                vehicle.mileage = newMileage;
                this.setLocalVehicle(vehicle);
                this.editVehicle(vehicle);
              }else{
                console.log("vehicle.mileage = mileage;");
                vehicle.mileage = mileage;
                this.setLocalVehicle(vehicle);
                this.editVehicle(vehicle);
              }
            }
          }
        }
      }
    }
  }

  getRefuelFirestoreCollection(vehicle_id, timestampStart, timestampEnd, lastFieldRefuel_timestamp): any{
    if(lastFieldRefuel_timestamp && lastFieldRefuel_timestamp != 0){
      if(timestampStart && timestampEnd){
        return this.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.where('timestamp', '>=', timestampStart).where('timestamp', '<=', timestampEnd)
          .orderBy('timestamp', 'desc').startAfter(lastFieldRefuel_timestamp).limit(environment.pageNumberElements)
        );
      }else if(timestampStart){
        return this.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.where('timestamp', '>=', timestampStart)
          .orderBy('timestamp', 'desc').startAfter(lastFieldRefuel_timestamp).limit(environment.pageNumberElements)
        );
      }else if(timestampEnd){
        return this.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.where('timestamp', '<=', timestampEnd)
          .orderBy('timestamp', 'desc').startAfter(lastFieldRefuel_timestamp).limit(environment.pageNumberElements)
        );
      }else{
        return this.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.orderBy('timestamp', 'desc').startAfter(lastFieldRefuel_timestamp).limit(environment.pageNumberElements)
        );
      }
    }else{
      if(timestampStart && timestampEnd){
        return this.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.where('timestamp', '>=', timestampStart).where('timestamp', '<=', timestampEnd)
          .orderBy('timestamp', 'desc').limit(environment.pageNumberElements)
        );
      }else if(timestampStart){
        return this.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.where('timestamp', '>=', timestampStart)
          .orderBy('timestamp', 'desc').limit(environment.pageNumberElements)
        );
      }else if(timestampEnd){
        return this.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.where('timestamp', '<=', timestampEnd)
          .orderBy('timestamp', 'desc').limit(environment.pageNumberElements)
        );
      }else{
        return this.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.orderBy('timestamp', 'desc').limit(environment.pageNumberElements)
        );
      }
    }
  }

}
