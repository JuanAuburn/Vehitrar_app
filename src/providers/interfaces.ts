export interface UserInterface {
  uid: string;
  name: string;
  lastname: string;
}

export interface VehicleInterface {
  id?: string;
  name: string;
  model: string;
  mileage: string;
  type: string;
  refuels?: RefuelInterface[];
  refactions?: RefactionInterface[];
}

export interface RefuelInterface {
  id?: string;
  gallons: string;
  mileage: string;
  price: string;
  gasolineType?: string;
  timestamp: number;
}

export interface RefactionInterface {
  id?: string;
  mileage: string;
  price: string;
  name: string;
  description?: string;
  timestamp: number;
}

export interface ChangeOilInterface {
}

export interface SoatTecInterface {
}
