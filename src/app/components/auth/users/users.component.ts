import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/users.service';
import { Users } from '../../../models/users.model';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users?: Users[];
  currentUser?: Users;
  currentIndex = -1;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.retrieveUsers();
  }

  retrieveUsers(): void {
    this.userService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() as Users })
        )
      )
    ).subscribe(data => {
      this.users = data;
    });
  }

  setActiveUser(user: Users, index: number): void {
    this.currentUser = user;
    this.currentIndex = index;
  }



  loginWithGoogle() {
    this.userService.loginWithGoogle().then(() => {
      console.log('Logged in with Google');
    }).catch((error) => {
      console.log(error);
    });
  }

  logout() {
    this.userService.logout().then(() => {
      console.log('Salir de Google');
    }).catch((error) => {
      console.log(error);
    });
  }
}