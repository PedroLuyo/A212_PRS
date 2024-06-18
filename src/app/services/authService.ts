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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  obtenerNombreGestorAutenticado(): Promise<string> {
    return new Promise((resolve, reject) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.db
            .collection('users')
            .doc(user.uid)
            .get()
            .subscribe((doc) => {
              if (doc.exists) {
                const userData = doc.data() as { name?: string };
                const firstName = userData.name?.split(' ')[0] || '';
                resolve(firstName);
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
      } else {
        localStorage.setItem('user', 'null');
      }
    });
  }

  getUserName(): Promise<string> {
    return new Promise((resolve, reject) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.db
            .collection('users')
            .doc(user.uid)
            .get()
            .subscribe((doc) => {
              if (doc.exists) {
                const userData = doc.data() as { name?: string };
                const firstName = userData.name?.split(' ')[0] || '';
                resolve(firstName);
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

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider).then(credential => {
      const user = credential.user;
      if (user) {
        this.db.collection('users').doc(user.uid).get().subscribe(userDoc => {
          if (!userDoc.exists) {
            const userData = {
              uid: user.uid,
              email: user.email,
              name: user.displayName,
              role: 'comensal',
              direccion: '',
              dni: null,
              estado: 'A',
              ruc: null
            };
            this.db
              .collection('users')
              .doc(user.uid)
              .set(userData, { merge: true });
          }
        });
      }
      return user;
    });
  }

  logout() {
    return signOut(this.auth);
  }

  addUser(user: Users) {
    return this.usersCollection.add(user);
  }

  async register({ email, password, name, role, direccion, dni, estado, ruc }: any) {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = credential.user;

    if (user) {
      await updateProfile(user, { displayName: name });
      const userData = {
        uid: user.uid,
        email,
        name,
        role,
        direccion,
        dni,
        estado,
        ruc,
        active: true
      };
      await this.db
        .collection('users')
        .doc(user.uid)
        .set(userData, { merge: true });
    }
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user != null;
  }

  async getUserRole(): Promise<string> {
    return new Promise((resolve, reject) => {
      const user = JSON.parse(localStorage.getItem('user')!);
      if (user) {
        this.db.collection('users').doc(user.uid).get().subscribe((doc) => {
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
          role: 'comensal',
          direccion: '',
          dni: null,
          estado: 'A',
          ruc: null,
          active: true
        },
        { merge: true }
      );
    }
  }

  updateUser(id: string, user: Users) {
    return this.usersCollection.doc(id).set(user, { merge: true });
  }

  deleteUser(id: string) {
    return this.usersCollection.doc(id).delete();
  }
}
