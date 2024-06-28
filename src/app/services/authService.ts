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

    // Suscripción al estado de autenticación de Firebase Auth
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
      } else {
        localStorage.setItem('user', 'null');
      }
    });
  }

  // Método para obtener el nombre del usuario autenticado desde Firestore
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

  // Método para obtener el nombre del usuario desde Firestore
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

  // Método para crear un usuario en Firestore
  create(user: Users) {
    return this.usersCollection.add(user);
  }

  // Método para obtener todos los usuarios de Firestore
  getAll(): AngularFirestoreCollection<Users> {
    return this.usersCollection;
  }

  // Método para iniciar sesión con correo y contraseña
  async login({ email, password }: any) {
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    this.userLoggedIn.emit();
    return result;
  }

  // Método para iniciar sesión con Google
  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider).then(credential => {
      const user = credential.user;
      if (user) {
        // Verifica si el usuario existe en Firestore antes de agregarlo
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

  // Método para cerrar sesión
  logout() {
    return signOut(this.auth);
  }

  // Método para agregar un usuario en Firestore
  addUser(user: Users) {
    return this.usersCollection.add(user);
  }

  // Método para registrar un nuevo usuario
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

  // Método para verificar si hay un usuario autenticado
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user != null;
  }

  // Método para obtener el rol de usuario desde Firestore
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

  // Método para iniciar sesión con Google
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

  // Método para actualizar un usuario en Firestore
  updateUser(id: string, user: Users) {
    // Evita que se actualicen las propiedades "editable" y "docId" en Firestore
    const { editable, docId, ...userData } = user;
    return this.usersCollection.doc(id).update(userData);
  }

  // Método para eliminar un usuario en Firestore
  deleteUser(id: string) {
    return this.usersCollection.doc(id).delete();
  }
}
