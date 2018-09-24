export class DateFunctions {
  getDay(timestamp: number): string{
    var date = new Date(timestamp);
    var day = "";
    switch (date.getDay()) {
      case 0:
      day = "Domingo";
      break;
      case 1:
      day = "Lunes";
      break;
      case 2:
      day = "Martes";
      break;
      case 3:
      day = "Miercoles";
      break;
      case 4:
      day = "Jueves";
      break;
      case 5:
      day = "Viernes";
      break;
      case 6:
      day = "Sabado";
    }
    return day;
  }

  getDateNowForInput(): string{
    var date = new Date();
    var dateString = date.getFullYear()+"-"+this.comp(date.getMonth()+1)+"-"+this.comp(date.getDate())+"T"+this.comp(date.getHours())+":"+this.comp(date.getMinutes());
    return dateString;
  }

  getCompleteDateNowForInput(): string{
    var date = new Date();
    var dateString = date.getFullYear()+"-"+this.comp(date.getMonth()+1)+"-"+this.comp(date.getDate());
    return dateString;
  }

  getDDMMYYYY(timestamp: number): string{
    var date = new Date(timestamp);
    var day = this.comp(date.getDate())+"/"+this.comp(date.getMonth()+1)+"/"+date.getFullYear();
    return day;
  }

  getHHSS(timestamp: number): string{
    var date = new Date(timestamp);
    var hoursandseconds = this.comp(date.getHours())+":"+this.comp(date.getMinutes());
    return hoursandseconds;
  }

  getDateForInput(timestamp: number): string{
    var date = new Date(timestamp);
    var dateString = date.getFullYear()+"-"+this.comp(date.getMonth()+1)+"-"+this.comp(date.getDate())+"T"+this.comp(date.getHours())+":"+this.comp(date.getMinutes());
    return dateString;
  }

  getCompleteDateForInput(timestamp: number): string{
    var date = new Date(timestamp);
    var dateString = date.getFullYear()+"-"+this.comp(date.getMonth()+1)+"-"+this.comp(date.getDate());
    return dateString;
  }

  comp(number: number): string{
    if(number < 10){
      return "0"+number;
    }else{
      return ""+number;
    }
  }
}
