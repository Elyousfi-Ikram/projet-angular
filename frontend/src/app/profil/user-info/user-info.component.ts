import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
})
export class UserInfoComponent implements OnInit {
  @Input() userData: User | null = null;
  editData: any = {};
  passwordData = { currentPassword: '', newPassword: '' };

  activeModal: 'edit' | 'password' | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // No longer need to load user data here, it's passed in via @Input
  }

  loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
        if (user) {
            this.userData = user;
            this.editData = { ...user };
        }
    });
  }

  openModal(modalType: 'edit' | 'password'): void {
    this.activeModal = modalType;
    if (modalType === 'edit') {
      this.editData = { ...this.userData };
    } else {
      this.passwordData = { currentPassword: '', newPassword: '' };
    }
  }

  closeModal(): void {
    this.activeModal = null;
  }

  handleUpdateUser(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    // Assurez-vous que l'ID utilisateur est inclus si votre API l'exige dans le corps
    const userDataToUpdate = { ...this.editData, id: this.userData?._id };

    this.userService.updateUser(userDataToUpdate).subscribe({
      next: (updatedUser: User) => {
        this.notificationService.showNotification({ message: 'Profil mis à jour avec succès.', type: 'success' });
        this.closeModal();
      },
      error: (err: any) => {
         console.error(err);
      },
    });
  }

  handlePasswordChange(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.userService.changePassword(this.passwordData).subscribe({
      next: () => {
        this.notificationService.showNotification({ message: 'Mot de passe changé avec succès.', type: 'success' });
        this.closeModal();
      },
       error: (err: any) => {
         console.error(err);
      },
    });
  }

  handleDeleteAccount(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      this.userService.deleteAccount().subscribe({
        next: () => {
          this.notificationService.showNotification({ message: 'Compte supprimé avec succès.', type: 'success' });
          this.authService.logout();
        },
         error: (err: any) => {
         console.error(err);
      },
      });
    }
  }
}