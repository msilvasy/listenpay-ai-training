/* Clinical Signal Console: application root keeps launch-time authentication separate from routed portal content. */
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginModal } from './components/login-modal/login-modal.component';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginModal],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {
  // Injected at the root so the saved theme preference is applied as early as possible.
  private readonly themeService = inject(ThemeService);
}
