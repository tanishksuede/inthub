import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-nav-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Desktop Sidebar -->
    <aside class="w-64 fixed h-full bg-white border-r border-gray-200 flex flex-col hidden md:flex z-30">
      <!-- Desktop Branding Header -->
      <div class="h-20 flex items-center px-6 border-b border-gray-100 bg-white">
        <div class="flex items-center gap-3" routerLink="/home" class="cursor-pointer">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg shadow-blue-200">
            <i class="fa-solid fa-layer-group"></i>
          </div>
          <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">Interview Hub</span>
        </div>
      </div>

      <nav class="space-y-1 flex-1 px-4 py-6 overflow-y-auto">
        <a routerLink="/home" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <i class="fa-solid fa-house w-5 text-center"></i>
          <span class="font-medium">Home Feed</span>
        </a>
        <a routerLink="/trending" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <i class="fa-solid fa-fire w-5 text-center"></i>
          <span class="font-medium">Trending</span>
        </a>
        <a routerLink="/search" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <i class="fa-solid fa-magnifying-glass w-5 text-center"></i>
          <span class="font-medium">Search</span>
        </a>
        <a routerLink="/hashtags" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <i class="fa-solid fa-hashtag w-5 text-center"></i>
          <span class="font-medium">Hashtags</span>
        </a>
        <a routerLink="/profile" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <i class="fa-solid fa-user w-5 text-center"></i>
          <span class="font-medium">Profile</span>
        </a>
        
        <div class="pt-4">
          <button routerLink="/create" class="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <i class="fa-solid fa-pen"></i>
            Share Experience
          </button>
        </div>
      </nav>

      <div class="p-4 border-t border-gray-100 bg-gray-50/50">
        <div class="flex items-center gap-3 px-2">
          <img [src]="user()?.avatarUrl" class="w-10 h-10 rounded-full bg-gray-200 border border-white shadow-sm">
          <div class="flex-1 overflow-hidden">
            <p class="text-sm font-semibold truncate text-gray-900">{{ user()?.name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ user()?.email }}</p>
          </div>
          <button (click)="logout()" class="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Top Header -->
    <header class="md:hidden fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-4 z-40 transition-all">
       <div class="flex items-center gap-3" routerLink="/home">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm shadow-md">
             <i class="fa-solid fa-layer-group"></i>
          </div>
          <span class="text-lg font-bold text-gray-900 tracking-tight">Interview Hub</span>
       </div>
       
       <div class="flex items-center gap-3">
         <img [src]="user()?.avatarUrl" class="w-8 h-8 rounded-full bg-gray-200 border border-gray-200" [routerLink]="['/profile']">
         <button (click)="logout()" class="text-gray-400 hover:text-red-500"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
       </div>
    </header>

    <!-- Mobile Nav (Bottom) -->
    <nav class="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <a routerLink="/home" routerLinkActive="text-blue-600" class="text-gray-400 text-xl p-2 transition-colors"><i class="fa-solid fa-house"></i></a>
      <a routerLink="/trending" routerLinkActive="text-blue-600" class="text-gray-400 text-xl p-2 transition-colors"><i class="fa-solid fa-fire"></i></a>
      <a routerLink="/create" class="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center -mt-8 shadow-lg shadow-blue-300 ring-4 ring-white"><i class="fa-solid fa-plus text-xl"></i></a>
      <a routerLink="/search" routerLinkActive="text-blue-600" class="text-gray-400 text-xl p-2 transition-colors"><i class="fa-solid fa-magnifying-glass"></i></a>
      <a routerLink="/profile" routerLinkActive="text-blue-600" class="text-gray-400 text-xl p-2 transition-colors"><i class="fa-solid fa-user"></i></a>
    </nav>
  `
})
export class NavSidebarComponent {
  dataService = inject(DataService);
  user = this.dataService.currentUser;

  logout() {
    this.dataService.logout();
  }
}