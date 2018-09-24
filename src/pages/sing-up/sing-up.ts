import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { HomePage } from "../pages";

@Component({
  selector: 'page-sing-up',
  templateUrl: 'sing-up.html',
})
export class SingUpPage {
  passwordType1: string = 'password';
  passwordIcon1: string = 'eye-off';
  passwordType2: string = 'password';
  passwordIcon2: string = 'eye-off';
  email: string = "";
  password1: string = "";
  password2: string = "";
  inValidEmail: boolean = false;
  inValidEmailMessage = "El correo no es correcto";
  inValidPassword1: boolean = false;
  inValidPassword1Message = "La contraseña debe ser de más de 6 caracteres";
  inValidPassword2: boolean = false;
  inValidPassword2Message = "Las contraseñas no coinciden";
  loading_sing_up: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public afAuth: AngularFireAuth,
    private alertCtrl: AlertController
  ) {
  }

  registerUser(){
    this.loading_sing_up = true;
    this.afAuth.auth.createUserWithEmailAndPassword(this.email, this.password1).then(
      (result)=>{
        console.log(this.afAuth.authState);
        this.loading_sing_up = false;
        this.navCtrl.setRoot(HomePage);
      },
      (error) => {
        console.log(error);
        this.loading_sing_up = false;
        this.errorSingIn(error);
      }
    ).catch((error) => {
      this.loading_sing_up = false;
      this.errorSingIn(error);
    });
  }

  errorSingIn(error){
    try{
      if (error.code == 'auth/email-already-in-use'){
        this.presentAlert("El correo ya esta en uso :(", "Que tal si pruebas con otro");
      }else if(error.code == 'auth/invalid-email'){
        this.presentAlert("El correo no es valido", "Por favor compruebalo o intenta con otro");
      }else if(error.code == 'auth/weak-password'){
        this.presentAlert("La contraseña es demasiado fácil", "Trata de poner una mas complicada");
      }else{
        this.presentAlert("Opss, Hubo un error :(", "Por favor revisa tu conexión a internet y vuelve a intentarlo");
      }
    }catch(error){
      this.presentAlert("Opss, Hubo un error :(", "Por favor revisa tu conexión a internet y vuelve a intentarlo");
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

  closeOut(event: Event){
    if (event && event.srcElement && event.srcElement.className && event.srcElement.className == "scroll-content") {
      this.viewCtrl.dismiss();
    }
  }

  checkEmail(){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(re.test(String(this.email).toLowerCase())){
      this.inValidEmail = false;
    }else{
      this.inValidEmail = true;
    }
  }

  checkPassword1(){
    if (this.password1.length != 0 && this.password1.length < 6) {
      this.inValidPassword1 = true;
    }else{
      this.inValidPassword1 = false;
    }
  }

  checkPassword2(){
    if (this.password2.length > this.password1.length || this.password1.substr(0, this.password2.length) != this.password2) {
      this.inValidPassword2 = true;
    }else{
      this.inValidPassword2 = false;
    }
  }

  showHidePassword1(){
    this.passwordType1 = this.passwordType1 === 'text' ? 'password' : 'text';
    this.passwordIcon1 = this.passwordIcon1 === 'eye-off' ? 'eye' : 'eye-off';
  }

  showHidePassword2(){
    this.passwordType2 = this.passwordType2 === 'text' ? 'password' : 'text';
    this.passwordIcon2 = this.passwordIcon2 === 'eye-off' ? 'eye' : 'eye-off';
  }
}
