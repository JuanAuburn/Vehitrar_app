import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { Subscription } from 'rxjs';
import { GooglePlus } from "@ionic-native/google-plus";
import { environment } from '../../environments/environment';
import * as firebase  from 'firebase/app';

interface SubscriptionDictionary {
    key: string;
    subscription: Subscription;
}

@Injectable()
export class AuthProvider {
  private user: firebase.User;
  private SubscriptionArray: SubscriptionDictionary[] = [];

  constructor(
    public afAuth: AngularFireAuth,
    private gplus: GooglePlus,
    public platform: Platform
  ) {
  }

  addSubscription(key: string, subscribe: Subscription){
    this.SubscriptionArray.push({
      key: key,
      subscription: subscribe
    });
  }

  setUser(user){
    this.user = user;
  }

  getUserId(): string{
    return this.user.uid;
  }

  signInWithEmailAndPassword(email, password): Promise<any>{
    return this.afAuth.auth.signInWithEmailAndPassword(email,
			 password);
  }

  signInWithGoogle(): Promise<any>{
    console.log("signInWithGoogle()");
    if (this.platform.is('cordova')) {
      return this.nativeGoogleLogin();
    }else{
      return this.webGoogleLogin();
    }
  }

  async webGoogleLogin(): Promise<any>{
    console.log('webGoogleLogin()');
    try{
      const provider = new firebase.auth.GoogleAuthProvider();
  		return this.afAuth.auth.signInWithRedirect(provider).then(() => {
  			return this.afAuth.auth.getRedirectResult().then((result: any) => {
  				// This gives you a Google Access Token.
  				// You can use it to access the Google API.
  				let token = result.credential.accessToken;
  				// The signed-in user info.
  				let user = result.user;
  				console.log(token, user);
  			}).catch(function(error) {
  				// Handle Errors here.
  				alert(error.message);
  			});
  		});
    }catch(error){
      console.log(error);
    }
  }

  nativeGoogleLogin(): Promise<any>{
    return new Promise((resolve, reject)=>{
      console.log('nativeGoogleLogin()');
      try{
        const clientId = environment.GOOGLE_CLIENT_ID;
        const googleOptions = { 'webClientId': clientId, 'offline': true };
        this.gplus.login(googleOptions).then((result)=>{
          //console.log(JSON.stringify(result));
          var credential = firebase.auth.GoogleAuthProvider.credential(result.idToken, result.accessToken);
          this.afAuth.auth.signInAndRetrieveDataWithCredential(credential)
          .then((userCredentials)=>{
            console.log('login sucessfull');
            resolve();
          }).catch((error)=>{
            console.log(JSON.stringify(error));
            reject();
          });
        }).catch((error)=>{
          console.log(JSON.stringify(error));
          reject();
        });
      }catch(error){
        console.log(JSON.stringify(error));
        reject();
      };
    });
  }

  logout(){
    this.user = null;
    this.afAuth.auth.signOut();
    if (this.platform.is('cordova')) {
        this.gplus.logout();
    }
  }

}
