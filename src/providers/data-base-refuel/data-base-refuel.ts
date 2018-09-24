import { Injectable } from '@angular/core';
import {
  DataBaseProvider,
  VehicleInterface,
  RefuelInterface
} from '../../providers/providers';
import { environment } from "../../environments/environment";
import 'rxjs/add/operator/map';

@Injectable()
export class DataBaseRefuelProvider {

  db: DataBaseProvider;

  constructor() {
  }

  init(db: DataBaseProvider){
    this.db = db;
  }

  getLocalRefuel(vehicleId: string, refuelId: string): RefuelInterface{
    this.db.vehicles.forEach(vehicle=>{
      if(vehicleId == vehicle.id){
        vehicle.refuels.forEach(refuel=>{
          if (refuelId == refuel.id) {
            return refuel;
          }
        });
      }
    });
    return;
  }
  setLocalRefuel(vehicleId: string, refuel: RefuelInterface){
    for (let i = 0; i < this.db.vehicles.length; i++) {
      if(this.db.vehicles[i].id == vehicleId){
        for (let j = 0; j < this.db.vehicles[i].refuels.length; j++) {
          if(this.db.vehicles[i].refuels[j].id == refuel.id){
            this.db.vehicles[i].refuels[j] = refuel;
          }
        }
      }
    }
  }
  deleteLocalRefuel(vehicleId: string, refuelId: string){
    for (let i = 0; i < this.db.vehicles.length; i++) {
      if(this.db.vehicles[i].id == vehicleId){
        for (let j = 0; j < this.db.vehicles[i].refuels.length; j++) {
          if(this.db.vehicles[i].refuels[j].id == refuelId){
            this.db.vehicles[i].refuels.splice(j, 1);
          }
        }
      }
    }
  }


  // --------------------- Refuel Functions ---------------------
  getRefuelsTimestamp(vehicle: VehicleInterface, timestampStart?: number, timestampEnd?: number, lastFieldRefuel_timestamp?: number): Promise<VehicleInterface>{
    console.log("getRefuelsTimestamp("+vehicle.id+", "+timestampStart+", "+timestampEnd+", "+lastFieldRefuel_timestamp+")");
    var document: any;
    return new Promise((resolve, reject) => {
      document = this.getRefuelFirestoreCollection(vehicle.id, timestampStart, timestampEnd, lastFieldRefuel_timestamp);
      var subscribe = document.snapshotChanges().map((resp: any)=> {
        var data: RefuelInterface[] = [];
        resp.forEach((element)=>{
          var dataElement = element.payload.doc.data();
          dataElement.id = element.payload.doc.id;
          //add gasolineType
          if(!dataElement.gasolineType){
            dataElement.gasolineType = "corriente";
          }
          data.push(dataElement);
        });
        return data;
      }).subscribe((refuels)=>{
        this.db.vehicles.forEach((vehicleForEach)=>{
          if(vehicleForEach.id == vehicle.id){
            refuels.forEach(refuelResponse=>{
              if (!vehicleForEach.refuels.find((ref)=>{return ref.id===refuelResponse.id})){
                vehicleForEach.refuels.push(refuelResponse);
              }
            });
            vehicle.refuels.sort((a, b)=>{
              if (a.timestamp < b.timestamp) {
                return 1;
              }
              if (a.timestamp > b.timestamp) {
                return -1;
              }
              // a debe ser igual b
              return 0;
            });
          }
        });
        resolve(vehicle);
        subscribe.unsubscribe();
        subscribe.remove(subscribe);
      }, (error)=>{
        reject(error);
      });
    });
  }

  getRefuels(vehicle: VehicleInterface): Promise<VehicleInterface>{
    console.log("getRefuels()");
    return new Promise((resolve, reject) => {
      if(vehicle.refuels){
        console.log("Already");
        resolve(vehicle);
      }else{
        const timestampNow = new Date().getTime();
        const MinTimestampToSearch = timestampNow - environment.pageSearchsToTimestampDiference;
        var subscribe = this.db.vehiclesCollection.doc(vehicle.id)
        .collection("refuels", ref=>ref.where('timestamp', '>=', MinTimestampToSearch).orderBy('timestamp', 'desc'))
        .snapshotChanges().map((resp: any)=> {
          var data: RefuelInterface[] = [];
          resp.forEach((element)=>{
            var dataElement = element.payload.doc.data();
            dataElement.id = element.payload.doc.id;
            //add gasolineType
            if(!dataElement.gasolineType){
              dataElement.gasolineType = "corriente";
            }
            data.push(dataElement);
          });
          return data;
        }).subscribe((refuels)=>{
          this.db.vehicles.forEach((vehicleForEach)=>{
            if(vehicleForEach.id == vehicle.id){
              vehicleForEach.refuels = refuels;
            }
          });
          resolve(vehicle);
          subscribe.unsubscribe();
          subscribe.remove(subscribe);
        }, (error)=>{
          reject(error);
        });
      }
    });
  }

  addRefuel(vehicle: VehicleInterface, refuel: RefuelInterface): Promise<VehicleInterface>{
    console.log("addRefuel()");
    return new Promise((resolve, reject) => {
      this.db.vehicles.forEach((vehicleForEach)=>{
        if(vehicleForEach.id == vehicle.id){
          if(!refuel.id || refuel.id == ""){
            refuel.id = this.getIdtoRefuel(vehicle);
          }
          // Add refuel to vehicle.refuels in Local storage
          if(vehicleForEach.refuels){
            vehicleForEach.refuels.unshift(refuel);
          }else{
            vehicleForEach.refuels = [refuel];
          }
          // Update mileage to vehicle
          this.setVehicleMileage(vehicle, refuel.mileage);
          // setTimeout if the operation is offline
          var timeout = setTimeout(()=>{
              console.log('timeOut');
              resolve(vehicle);
            }, environment.timeOutToService
          );
          // Add refuel to vehicle.refuels in Cloud storage
          this.db.vehiclesCollection.doc(vehicle.id).collection('refuels').doc(refuel.id).set(refuel).then(()=>{
            clearTimeout(timeout);
            resolve(vehicle);
          }).catch((error)=>{
            for (let i = 0; i < vehicle.refuels.length; i++) {
              if(vehicle.refuels[i].id == refuel.id){
                vehicle.refuels.splice(i, 1);
              }
            }
            reject(error);
          });
        }
      });
    });
  }

  editRefuel(vehicle: VehicleInterface, refuel: RefuelInterface): Promise<VehicleInterface>{
    console.log("editRefuel()");
    return new Promise((resolve, reject) => {
      vehicle.refuels.forEach(refuelForEach=>{
        if(refuelForEach.id == refuel.id){
          const previousMileage = refuelForEach.mileage;
          this.setVehicleMileage(vehicle, refuel.mileage, previousMileage, refuel.id);
        }
      });
      this.setLocalRefuel(vehicle.id, refuel);
      var timeout = setTimeout(()=>{
          console.log('timeOut');
          resolve(vehicle);
        }, environment.timeOutToService
      );
      this.db.vehiclesCollection.doc(vehicle.id).collection('refuels').doc(refuel.id).update(refuel).then(()=>{
        clearTimeout(timeout);
        resolve(vehicle);
      }).catch((error)=>{
        reject(error);
      });
    });
  }

  deleteRefuel(vehicle: VehicleInterface, refuel: RefuelInterface): Promise<void>{
    console.log("deleteRefuel()");
    return new Promise((resolve, reject) => {;
      this.setVehicleMileage(vehicle, '0', refuel.mileage, refuel.id);
      this.deleteLocalRefuel(vehicle.id, refuel.id);
      var timeout = setTimeout(()=>{
          console.log('timeOut');
          resolve();
        }, environment.timeOutToService
      );
      this.db.vehiclesCollection.doc(vehicle.id).collection('refuels').doc(refuel.id).delete().then(()=>{
        clearTimeout(timeout);
        resolve();
      }).catch((error)=>{
        reject(error);
      });
    });
  }

  setVehicleMileage(vehicle: VehicleInterface, newMileage: string, previousMileage?: string, elementId?: string){
    console.log("setVehicleMileage(vehicle, newMileage:"+newMileage+", previousMileage:"+previousMileage+", elementId:"+elementId+")");
    if(vehicle.mileage != newMileage){
      console.log("vehicle.mileage != newMileage");
      if(parseInt(vehicle.mileage) < parseInt(newMileage)){
        console.log("vehicle.mileage < newMileage");
        vehicle.mileage = newMileage;
        this.db.setLocalVehicle(vehicle);
        this.db.editVehicle(vehicle);
      }else{
        if(previousMileage){
          if(vehicle.mileage == previousMileage){
            console.log("vehicle.mileage == previousMileage");
            const mileage = this.db.getLastMileage(vehicle, elementId);
            console.log("lastMileage: "+mileage);
            if(mileage != '0'){
              if(parseInt(mileage) < parseInt(newMileage)){
                console.log("mileage < newMileage");
                vehicle.mileage = newMileage;
                this.db.setLocalVehicle(vehicle);
                this.db.editVehicle(vehicle);
              }else{
                console.log("vehicle.mileage = mileage;");
                vehicle.mileage = mileage;
                this.db.setLocalVehicle(vehicle);
                this.db.editVehicle(vehicle);
              }
            }
          }
        }
      }
    }
  }

  getIdtoRefuel(vehicle: VehicleInterface): string{
    var finish = false;
    var id = "";
    while(!finish){
      finish = true;
      id = this.db.getAleatoryId();
      vehicle.refuels.forEach(refuel =>{
        if(refuel.id == id){
          finish = false;
        }
      });
    }
    return id;
  }

  getRefuelFirestoreCollection(vehicle_id, timestampStart, timestampEnd, lastFieldRefuel_timestamp): any{
    if(lastFieldRefuel_timestamp && lastFieldRefuel_timestamp != 0){
      if(timestampStart && timestampEnd){
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.where('timestamp', '>=', timestampStart).where('timestamp', '<=', timestampEnd)
          .orderBy('timestamp', 'desc').startAfter(lastFieldRefuel_timestamp).limit(environment.pageNumberElements)
        );
      }else if(timestampStart){
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.where('timestamp', '>=', timestampStart)
          .orderBy('timestamp', 'desc').startAfter(lastFieldRefuel_timestamp).limit(environment.pageNumberElements)
        );
      }else if(timestampEnd){
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.where('timestamp', '<=', timestampEnd)
          .orderBy('timestamp', 'desc').startAfter(lastFieldRefuel_timestamp).limit(environment.pageNumberElements)
        );
      }else{
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.orderBy('timestamp', 'desc').startAfter(lastFieldRefuel_timestamp).limit(environment.pageNumberElements)
        );
      }
    }else{
      if(timestampStart && timestampEnd){
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.where('timestamp', '>=', timestampStart).where('timestamp', '<=', timestampEnd)
          .orderBy('timestamp', 'desc').limit(environment.pageNumberElements)
        );
      }else if(timestampStart){
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.where('timestamp', '>=', timestampStart)
          .orderBy('timestamp', 'desc').limit(environment.pageNumberElements)
        );
      }else if(timestampEnd){
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.where('timestamp', '<=', timestampEnd)
          .orderBy('timestamp', 'desc').limit(environment.pageNumberElements)
        );
      }else{
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refuels",
          ref=>ref.orderBy('timestamp', 'desc').limit(environment.pageNumberElements)
        );
      }
    }
  }

}
