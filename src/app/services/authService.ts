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
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

// No debemos guardar las contraseñas en Firestore porque Firebase Auth maneja la autenticación y el almacenamiento seguro de contraseñas por nosotros.
// Almacenar las contraseñas en nuestra base de datos podría representar un riesgo de seguridad si la base de datos es comprometida.
// Además, no necesitamos las contraseñas para identificar a los usuarios una vez que se han autenticado.

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<Users>;
  private userData: any;

  userLoggedIn = new EventEmitter<void>();
  constructor(
    private db: AngularFirestore,
    private auth: Auth,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.usersCollection = db.collection<Users>('users');
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user')!);
      } else {
        localStorage.setItem('user', 'null');
        JSON.parse(localStorage.getItem('user')!);
      }
    });
  }

  getUserName(): Promise<string> {
    return new Promise((resolve, reject) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.db.collection('users').doc(user.uid).get().subscribe((doc) => {
            if (doc.exists) {
              const userData = doc.data() as { name?: string };
              resolve(userData.name || '');
            } else {
              reject('No se encontró el usuario en Firestore');
            }
          });
        } else {
          reject('No hay usuario');
        }
      });
    });
  }
  create(user: Users) {
    return this.usersCollection.add(user);
  }

  getAll(): AngularFirestoreCollection<Users> {
    return this.usersCollection;
  }

  async login({ email, password }: any) {
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    this.userLoggedIn.emit();
    return result;
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);
    const user = credential.user;

    if (user) {
      const userData = {
        uid: user.uid,
        email: user.email, //
        name: user.displayName,
        role: 'comensal',
      };

      await this.db
        .collection('users')
        .doc(user.uid)
        .set(userData, { merge: true });
    }

    return user;
  }
  logout() {
    return signOut(this.auth);
  }

  addUser(user: Users) {
    return this.usersCollection.add(user);
  }

  async register({ email, password, name, role }: any) {
    const credential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    const user = credential.user;

    if (user) {
      await updateProfile(user, { displayName: name });

      const userData = {
        uid: user.uid,
        email,
        name,
        role,
      };

      await this.db
        .collection('users')
        .doc(user.uid)
        .set(userData, { merge: true });
    }
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    if (user == null) {
      return false;
    } else {
      return true;
    }
  }

  async getUserRole(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.afAuth.authState.subscribe((user) => {
        if (user) {
          this.db
            .collection('users')
            .doc(user.uid)
            .get()
            .subscribe((doc) => {
              if (doc.exists) {
                const userData = doc.data() as { role?: string };
                resolve(userData.role || '');
              } else {
                reject('No se encontró el rol del usuario');
              }
            });
        } else {
          reject('No hay usuario');
        }
      });
    });
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);
    const user = credential.user;

    if (user) {
      await this.db.collection('users').doc(user.uid).set(
        {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
        },
        { merge: true }
      );
    }
  }
}
