/* Clinical Signal Console: entry dialog uses a calm medical signal image with clear, low-friction sign-in affordances. */
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { SessionService } from '../../auth/session.service';

@Component({
  selector: 'app-login-modal',
  imports: [FormsModule],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.css',
})
export class LoginModal {
  // Skipped when the Dashboard Suite already signed the user in and handed over a valid JWT.
  protected readonly isOpen = signal(!inject(SessionService).isAuthenticated());
  protected readonly showPassword = signal(false);
  protected readonly submitted = signal(false);
  protected email = '';
  protected password = '';
  protected remember = false;

  protected signIn(form: NgForm): void {
    this.submitted.set(true);
    if (form.invalid) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      return;
    }
    this.isOpen.set(false);
  }

  protected showError(control: NgModel): boolean { return !!control.invalid && (control.touched || this.submitted()); }
  protected close(): void { this.isOpen.set(false); }
}
