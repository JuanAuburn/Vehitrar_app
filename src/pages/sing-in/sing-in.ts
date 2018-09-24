import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { AuthProvider } from '../../providers/providers';
import { SingUpPage, HomePage } from "../pages";

@Component({
  selector: 'page-sing-in',
  templateUrl: 'sing-in.html',
})
export class SingInPage {
  email: string = "";
  password: string = "";

  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';

  loading_sing_in: boolean = false;

  loading_sing_in_google: boolean = false;

  private loginForm: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public auth: AuthProvider,
    public modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.loginForm.enable();
  }

  loginUser(){
    this.loading_sing_in = true;
    this.auth.signInWithEmailAndPassword(this.email, this.password).then(
      (result) => {
        this.loading_sing_in = false;
        this.navCtrl.setRoot(HomePage)
      },
      (error) => {
        //console.log("error subscribe");
        console.log(error);
        this.loading_sing_in = false;
        this.errorSingIn(error);
      }
    ).catch((error) => {
      //console.log("error promise");
      console.log(error);
      this.loading_sing_in = false;
      this.errorSingIn(error);
    });
  }

  errorSingIn(error){
    try{
      if (error.code == "auth/user-not-found") {
        this.presentAlert("El correo o la contraseña son incorrectos", "Por favor compruebalos y vuelve a intentarlo");
      }else if(error.code == "auth/wrong-password"){
        this.presentAlert("El correo o la contraseña son incorrectos", "Por favor compruebalos y vuelve a intentarlo");
      }else{
        this.presentAlert("Opss, Hubo un error :(", "Por favor revisa tu conexión a internet y vuelve a intentarlo");
      }
    }catch(error){
      this.presentAlert("Opss, Hubo un error :(", "Por favor revisa tu conexión a internet y vuelve a intentarlo");
    }
  }

  loginUserWithGoogle(){
    this.loading_sing_in_google = true;
    this.auth.signInWithGoogle().then((result) => {
        this.loading_sing_in_google = false;
        this.navCtrl.setRoot(HomePage);
    }).catch((error) => {
      console.log(error);
      this.loading_sing_in_google = false;
    });
  }

  registerUser(){
    this.modalCtrl.create(SingUpPage).present();
  }

  showHidePassword(){
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  presentAlert(title: string, subTitle: string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      buttons: ['Ok']
    });
    alert.present();
  }

}
