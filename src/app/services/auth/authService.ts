import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument, // <-- Añadido
} from '@angular/fire/compat/firestore';
import { Users } from '../../models/users/users.model';
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
  getCurrentUser: any;

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
  

  // Método para verificar el rol del usuario autenticado
  async verificarRolGestor(): Promise<boolean> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userDoc = await this.db.collection('users').doc(user.uid).get().toPromise();
      if (userDoc && userDoc.exists) {
        const userData = userDoc.data() as { role?: string };
        return userData.role === 'gestor';
      }
    }
    return false;
  }


// Método para iniciar sesión con correo y contraseña
async login({ email, password }: any) {
  try {
    // Inicia sesión con el correo y contraseña proporcionados
    const result = await signInWithEmailAndPassword(this.auth, email, password);

    // Obtiene el UID del usuario autenticado
    const user = result.user;

    // Verifica el rol del usuario en Firestore
    const userDoc = await this.db.collection('users').doc(user.uid).get().toPromise();
    if (userDoc && userDoc.exists) {
      const userData = userDoc.data() as { role?: string };
      
      if (userData.role === 'gestor') {
        // Si el rol es "gestor", permite el acceso y emite el evento
        this.userLoggedIn.emit();
        return result;
      } else {
        // Si el rol no es "gestor", cierra sesión y muestra un mensaje de error
        await signOut(this.auth);
        throw new Error('No tienes el rol adecuado. Regístrate o ingresa con una cuenta válida.');
      }
    } else {
      // Si no se encuentra el usuario en Firestore, cierra sesión y muestra un mensaje de error
      await signOut(this.auth);
      throw new Error('No se encontró el usuario en Firestore.');
    }
  } catch (error) {
    // Maneja errores de inicio de sesión
    throw new Error((error as any).message);
  }
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
        direccion: direccion ?? null,
        dni: dni ?? null,
        estado: estado ?? null,
        ruc: ruc ?? null,
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

  // Método para obtener el UID del usuario desde Firestore
  async getUserUid(): Promise<string> {
    return new Promise((resolve, reject) => {
      const user = JSON.parse(localStorage.getItem('user')!);
      if (user) {
        this.db.collection('users').doc(user.uid).get().subscribe((doc) => {
          if (doc.exists) {
            resolve(user.uid);
          } else {
            reject('No se encontró el uid en Firestore');
          }
        });
      } else {
        reject('No hay uid');
      }
    });
  }

  // Método para obtener el RUC del usuario desde Firestore
  async getUserRUC(): Promise<string> {
    return new Promise((resolve, reject) => {
      const user = JSON.parse(localStorage.getItem('user')!);
      if (user) {
        this.db.collection('users').doc(user.uid).get().subscribe((doc) => {
          if (doc.exists) {
            const userData = doc.data() as { ruc?: string }; 
            resolve(userData.ruc || ''); 
          } else {
            reject('No se encontró el documento del usuario en Firestore');
          }
        });
      } else {
        reject('No hay usuario');
      }
    });
  }

  // Método para actualizar un usuario en Firestore
  updateUser(id: string, userData: Partial<Users>) {
    // Realiza la actualización solo con las propiedades provistas en userData
    return this.usersCollection.doc(id).update(userData);
  }
}
