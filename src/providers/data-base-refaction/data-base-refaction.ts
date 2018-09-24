import { Injectable } from '@angular/core';
import {
  DataBaseProvider,
  VehicleInterface,
  RefactionInterface
} from '../../providers/providers';
import { environment } from "../../environments/environment";
import 'rxjs/add/operator/map';

@Injectable()
export class DataBaseRefactionProvider {

  db: DataBaseProvider;

  constructor() {
  }

  init(db: DataBaseProvider){
    this.db = db;
  }

  getLocalRefaction(vehicleId: string, refactionId: string): RefactionInterface{
    this.db.vehicles.forEach(vehicle=>{
      if(vehicleId == vehicle.id){
        vehicle.refactions.forEach(refaction=>{
          if (refactionId == refaction.id) {
            return refaction;
          }
        });
      }
    });
    return;
  }
  setLocalRefaction(vehicleId: string, refaction: RefactionInterface){
    for (let i = 0; i < this.db.vehicles.length; i++) {
      if(this.db.vehicles[i].id == vehicleId){
        for (let j = 0; j < this.db.vehicles[i].refactions.length; j++) {
          if(this.db.vehicles[i].refactions[j].id == refaction.id){
            this.db.vehicles[i].refactions[j] = refaction;
          }
        }
      }
    }
  }
  deleteLocalRefaction(vehicleId: string, refactionId: string){
    for (let i = 0; i < this.db.vehicles.length; i++) {
      if(this.db.vehicles[i].id == vehicleId){
        for (let j = 0; j < this.db.vehicles[i].refactions.length; j++) {
          if(this.db.vehicles[i].refactions[j].id == refactionId){
            this.db.vehicles[i].refactions.splice(j, 1);
          }
        }
      }
    }
  }


  // --------------------- Refaction Functions ---------------------
  getRefactionsTimestamp(vehicle: VehicleInterface, timestampStart?: number, timestampEnd?: number, lastFieldRefaction_timestamp?: number): Promise<VehicleInterface>{
    console.log("getRefactionsTimestamp("+vehicle.id+", "+timestampStart+", "+timestampEnd+", "+lastFieldRefaction_timestamp+")");
    var document: any;
    return new Promise((resolve, reject) => {
      document = this.getRefactionFirestoreCollection(vehicle.id, timestampStart, timestampEnd, lastFieldRefaction_timestamp);
      var subscribe = document.snapshotChanges().map((resp: any)=> {
        var data: RefactionInterface[] = [];
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
      }).subscribe((refactions)=>{
        this.db.vehicles.forEach((vehicleForEach)=>{
          if(vehicleForEach.id == vehicle.id){
            refactions.forEach(refactionResponse=>{
              if (!vehicleForEach.refactions.find((ref)=>{return ref.id===refactionResponse.id})){
                vehicleForEach.refactions.push(refactionResponse);
              }
            });
            vehicle.refactions.sort((a, b)=>{
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

  getRefactions(vehicle: VehicleInterface): Promise<VehicleInterface>{
    console.log("getRefactions()");
    return new Promise((resolve, reject) => {
      if(vehicle.refactions){
        console.log("Already");
        resolve(vehicle);
      }else{
        const timestampNow = new Date().getTime();
        const MinTimestampToSearch = timestampNow - environment.pageSearchsToTimestampDiference;
        var subscribe = this.db.vehiclesCollection.doc(vehicle.id)
        .collection("refactions", ref=>ref.where('timestamp', '>=', MinTimestampToSearch).orderBy('timestamp', 'desc'))
        .snapshotChanges().map((resp: any)=> {
          var data: RefactionInterface[] = [];
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
        }).subscribe((refactions)=>{
          this.db.vehicles.forEach((vehicleForEach)=>{
            if(vehicleForEach.id == vehicle.id){
              vehicleForEach.refactions = refactions;
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

  addRefaction(vehicle: VehicleInterface, refaction: RefactionInterface): Promise<VehicleInterface>{
    console.log("addRefaction()");
    return new Promise((resolve, reject) => {
      this.db.vehicles.forEach((vehicleForEach)=>{
        if(vehicleForEach.id == vehicle.id){
          if(!refaction.id || refaction.id == ""){
            refaction.id = this.getIdtoRefaction(vehicle);
          }
          // Add refaction to vehicle.refactions in Local storage
          if(vehicleForEach.refactions){
            vehicleForEach.refactions.unshift(refaction);
          }else{
            vehicleForEach.refactions = [refaction];
          }
          // Update mileage to vehicle
          this.setVehicleMileage(vehicle, refaction.mileage);
          // setTimeout if the operation is offline
          var timeout = setTimeout(()=>{
              console.log('timeOut');
              resolve(vehicle);
            }, environment.timeOutToService
          );
          // Add refaction to vehicle.refactions in Cloud storage
          this.db.vehiclesCollection.doc(vehicle.id).collection('refactions').doc(refaction.id).set(refaction).then(()=>{
            clearTimeout(timeout);
            resolve(vehicle);
          }).catch((error)=>{
            for (let i = 0; i < vehicle.refactions.length; i++) {
              if(vehicle.refactions[i].id == refaction.id){
                vehicle.refactions.splice(i, 1);
              }
            }
            reject(error);
          });
        }
      });
    });
  }

  editRefaction(vehicle: VehicleInterface, refaction: RefactionInterface): Promise<VehicleInterface>{
    console.log("editRefaction()");
    return new Promise((resolve, reject) => {
      vehicle.refactions.forEach(refactionForEach=>{
        if(refactionForEach.id == refaction.id){
          const previousMileage = refactionForEach.mileage;
          this.setVehicleMileage(vehicle, refaction.mileage, previousMileage, refaction.id);
        }
      });
      this.setLocalRefaction(vehicle.id, refaction);
      var timeout = setTimeout(()=>{
          console.log('timeOut');
          resolve(vehicle);
        }, environment.timeOutToService
      );
      this.db.vehiclesCollection.doc(vehicle.id).collection('refactions').doc(refaction.id).update(refaction).then(()=>{
        clearTimeout(timeout);
        resolve(vehicle);
      }).catch((error)=>{
        reject(error);
      });
    });
  }

  deleteRefaction(vehicle: VehicleInterface, refaction: RefactionInterface): Promise<void>{
    console.log("deleteRefaction()");
    return new Promise((resolve, reject) => {;
      this.setVehicleMileage(vehicle, '0', refaction.mileage, refaction.id);
      this.deleteLocalRefaction(vehicle.id, refaction.id);
      var timeout = setTimeout(()=>{
          console.log('timeOut');
          resolve();
        }, environment.timeOutToService
      );
      this.db.vehiclesCollection.doc(vehicle.id).collection('refactions').doc(refaction.id).delete().then(()=>{
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

  getIdtoRefaction(vehicle: VehicleInterface): string{
    var finish = false;
    var id = "";
    while(!finish){
      finish = true;
      id = this.db.getAleatoryId();
      vehicle.refactions.forEach(refaction =>{
        if(refaction.id == id){
          finish = false;
        }
      });
    }
    return id;
  }

  getRefactionFirestoreCollection(vehicle_id, timestampStart, timestampEnd, lastFieldRefaction_timestamp): any{
    if(lastFieldRefaction_timestamp && lastFieldRefaction_timestamp != 0){
      if(timestampStart && timestampEnd){
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refactions",
          ref=>ref.where('timestamp', '>=', timestampStart).where('timestamp', '<=', timestampEnd)
          .orderBy('timestamp', 'desc').startAfter(lastFieldRefaction_timestamp).limit(environment.pageNumberElements)
        );
      }else if(timestampStart){
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refactions",
          ref=>ref.where('timestamp', '>=', timestampStart)
          .orderBy('timestamp', 'desc').startAfter(lastFieldRefaction_timestamp).limit(environment.pageNumberElements)
        );
      }else if(timestampEnd){
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refactions",
          ref=>ref.where('timestamp', '<=', timestampEnd)
          .orderBy('timestamp', 'desc').startAfter(lastFieldRefaction_timestamp).limit(environment.pageNumberElements)
        );
      }else{
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refactions",
          ref=>ref.orderBy('timestamp', 'desc').startAfter(lastFieldRefaction_timestamp).limit(environment.pageNumberElements)
        );
      }
    }else{
      if(timestampStart && timestampEnd){
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refactions",
          ref=>ref.where('timestamp', '>=', timestampStart).where('timestamp', '<=', timestampEnd)
          .orderBy('timestamp', 'desc').limit(environment.pageNumberElements)
        );
      }else if(timestampStart){
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refactions",
          ref=>ref.where('timestamp', '>=', timestampStart)
          .orderBy('timestamp', 'desc').limit(environment.pageNumberElements)
        );
      }else if(timestampEnd){
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refactions",
          ref=>ref.where('timestamp', '<=', timestampEnd)
          .orderBy('timestamp', 'desc').limit(environment.pageNumberElements)
        );
      }else{
        return this.db.vehiclesCollection.doc(vehicle_id)
        .collection(
          "refactions",
          ref=>ref.orderBy('timestamp', 'desc').limit(environment.pageNumberElements)
        );
      }
    }
  }

}
