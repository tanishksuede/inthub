import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl mb-4 shadow-blue-300 shadow-lg">
            <i class="fa-solid fa-layer-group"></i>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Interview Hub</h1>
          <p class="text-gray-500">Share knowledge, crack interviews.</p>
        </div>

        @if (isLogin()) {
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input [ngModel]="email()" (ngModelChange)="email.set($event)" type="email" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <button (click)="login()" class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Sign In</button>
            <p class="text-center text-sm text-gray-500">
              Don't have an account? <button (click)="isLogin.set(false)" class="text-blue-600 font-medium hover:underline">Sign Up</button>
            </p>
          </div>
        } @else {
          <div class="space-y-4">
             <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input [ngModel]="name()" (ngModelChange)="name.set($event)" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input [ngModel]="email()" (ngModelChange)="email.set($event)" type="email" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <button (click)="register()" class="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors">Create Account</button>
            <p class="text-center text-sm text-gray-500">
              Already have an account? <button (click)="isLogin.set(true)" class="text-blue-600 font-medium hover:underline">Log In</button>
            </p>
          </div>
        }
        
        <div class="mt-6 border-t pt-4 text-center">
            <button class="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 font-medium text-gray-700">
                <i class="fa-brands fa-google text-red-500"></i> Continue with Google
            </button>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  dataService = inject(DataService);
  isLogin = signal(true);
  email = signal('user0@example.com');
  name = signal('');

  login() {
    this.dataService.login(this.email());
  }

  register() {
    if (this.name() && this.email()) {
      this.dataService.register(this.name(), this.email());
    }
  }
}