import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Users } from '../models/users.model';
import {
  Auth,
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersCollection: AngularFirestoreCollection<Users>;

  constructor(private db: AngularFirestore, private auth: Auth) {
    this.usersCollection = db.collection<Users>('users');
  }

  getUserName(): Promise<string> {
    return new Promise((resolve, reject) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(user.displayName || '');
        } else {
          reject('No hay usuario');
        }
      });
    });
  }
  getAll(): AngularFirestoreCollection<Users> {
    return this.usersCollection;
  }

  login({ email, password }: any) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }
  logout() {
    return signOut(this.auth);
  }

  async register({ email, password, name, rol }: any) {
    const credential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    const user = credential.user;

    if (user) {
      await updateProfile(user, { displayName: name });
      await this.db.collection('users').doc(user.uid).set({
        email,
        name,
        rol,
      });
    }
  }
}
/*
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Users } from '../models/users.model';
import { Auth, getAuth, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersCollection: AngularFirestoreCollection<Users>;

  constructor(private db: AngularFirestore, private auth: Auth) {
    this.usersCollection = db.collection<Users>('users');
  }

  async register({ email, password, name, rol }: any) {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = credential.user;
  
    if (user) {
      await updateProfile(user, { displayName: name });
      await this.db.collection('users').doc(user.uid).set({
        email,
        name,
        rol
      });
    }
  }

  getAll(): AngularFirestoreCollection<Users> {
    return this.usersCollection;
  }
  getUserName(): Promise<string> {
    return new Promise((resolve, reject) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(user.displayName || '');
        } else {
          reject('No hay usuario');
        }
      });
    });
  }
}
*/
