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
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersCollection: AngularFirestoreCollection<Users>;
  userLoggedIn = new EventEmitter<void>();
  constructor(private db: AngularFirestore, private auth: Auth) {
    this.usersCollection = db.collection<Users>('users');
  }

  getUserName(): Promise<string> {
    return new Promise((resolve, reject) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const firstName = (user.displayName || '').split(' ')[0];
          resolve(firstName);
        } else {
          reject('No hay usuario');
        }
      });
    });
  }
  getAll(): AngularFirestoreCollection<Users> {
    return this.usersCollection;
  }

  async login({ email, password }: any) {
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    this.userLoggedIn.emit();
    return result;
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  logout() {
    return signOut(this.auth);
  }

  addUser(user: Users) {
    return this.usersCollection.add(user);
  }

  async register({ email, password, name, surname, rol }: any) {
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
