import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavSidebarComponent } from './components/layout/nav-sidebar.component';
import { CommonModule } from '@angular/common';
import { ToastService } from './services/toast.service';
import { DataService } from './services/data.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavSidebarComponent, CommonModule],
  template: `
    <!-- Toast Container -->
    <div class="fixed top-5 right-5 z-50 flex flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-2 animate-bounce-in"
          [ngClass]="{
            'bg-green-600': toast.type === 'success',
            'bg-red-600': toast.type === 'error',
            'bg-blue-600': toast.type === 'info'
          }"
        >
          <i [class]="toast.type === 'success' ? 'fa-solid fa-check' : toast.type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-info'"></i>
          {{ toast.message }}
        </div>
      }
    </div>

    <div class="min-h-screen bg-gray-50 text-gray-900">
      @if (showSidebar()) {
        <app-nav-sidebar></app-nav-sidebar>
        
        <!-- Adjusted padding: pt-20 for mobile header, md:pt-8 for desktop -->
        <main class="md:ml-64 p-4 pt-20 md:p-8 md:pt-8 pb-24 md:pb-8">
           <router-outlet></router-outlet>
        </main>
      } @else {
        <router-outlet></router-outlet>
      }
    </div>
  `,
  styles: [`
    @keyframes bounceIn {
      0% { opacity: 0; transform: translateY(-20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .animate-bounce-in { animation: bounceIn 0.3s ease-out; }
  `]
})
export class AppComponent {
  toastService = inject(ToastService);
  router = inject(Router);
  dataService = inject(DataService);

  // We only show sidebar if user is logged in and not on login page
  // Since our AuthGuard redirects to /login if not logged in, we can mostly rely on route
  showSidebar = computed(() => {
     return !!this.dataService.currentUser() && this.currentUrl() !== '/login';
  });

  currentUrl = computed(() => {
     // This is a simplified way to trigger reactivity on route change since we can't use router state directly in computed easily without boilerplate
     // We will rely on the fact that if dataService.currentUser is null, we hide sidebar.
     // But for the specific /login page check, we'll manually track it.
     return this._currentUrl();
  });

  private _currentUrl = signal('/home');

  constructor() {
    this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
        this._currentUrl.set(event.urlAfterRedirects);
    });
  }
}