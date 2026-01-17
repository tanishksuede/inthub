import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Post } from '../../services/data.service';
import { PostCardComponent } from '../shared/post-card.component';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCardComponent, RouterModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h1 class="text-2xl font-bold mb-4">Find Experiences & People</h1>
        <div class="relative">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-gray-400"></i>
          <input 
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Search by name, company, role, or keywords..." 
            class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
          >
        </div>
        
        <div class="flex gap-2 mt-4 overflow-x-auto pb-2">
          @for (term of ['Google', 'System Design', 'Frontend', 'Amazon', 'Behavioral']; track term) {
            <button (click)="searchQuery.set(term)" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 whitespace-nowrap">
              {{ term }}
            </button>
          }
        </div>
      </div>

      @if (searchQuery().length > 1) {
        
        <!-- User Results -->
        @if (userResults().length > 0) {
          <div class="mb-8 animate-fade-in">
            <h2 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <i class="fa-solid fa-users text-blue-500"></i> People
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              @for (user of userResults(); track user.id) {
                <a [routerLink]="['/profile', user.id]" class="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <img [src]="user.avatarUrl" class="w-14 h-14 rounded-full object-cover border border-gray-100 group-hover:scale-105 transition-transform">
                  <div class="overflow-hidden">
                    <h3 class="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{{ user.name }}</h3>
                    <p class="text-xs text-gray-600 font-medium truncate">{{ user.role }}</p>
                    <p class="text-xs text-gray-400 truncate">{{ user.bio }}</p>
                    <div class="flex flex-wrap gap-1 mt-1">
                      @for (skill of user.skills.slice(0, 3); track skill) {
                         <span class="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{{ skill }}</span>
                      }
                    </div>
                  </div>
                </a>
              }
            </div>
          </div>
        }

        <!-- Post Results -->
        @if (postResults().length > 0) {
           <h2 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <i class="fa-solid fa-layer-group text-blue-500"></i> Experiences
           </h2>
           <div class="space-y-4 animate-fade-in" style="animation-delay: 0.1s">
            @for (post of postResults(); track post.id) {
              <app-post-card [post]="post"></app-post-card>
            }
          </div>
        }
        
        @if (userResults().length === 0 && postResults().length === 0) {
           <div class="text-center py-12 animate-fade-in">
             <div class="text-gray-300 text-6xl mb-4"><i class="fa-solid fa-ghost"></i></div>
             <p class="text-gray-500">No results found for "{{ searchQuery() }}"</p>
           </div>
        }

      } @else {
        <div class="text-center py-20 text-gray-400">
           Type something to search for people or experiences...
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  `]
})
export class SearchComponent implements OnInit {
  dataService = inject(DataService);
  route = inject(ActivatedRoute);
  searchQuery = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery.set(params['q']);
      }
    });
  }

  userResults = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (q.length < 2) return [];

    return this.dataService.users().filter(u => {
      const matchName = u.name.toLowerCase().includes(q);
      const matchRole = u.role.toLowerCase().includes(q);
      const matchBio = u.bio.toLowerCase().includes(q);
      const matchSkill = u.skills.some(s => s.toLowerCase().includes(q));
      return matchName || matchRole || matchBio || matchSkill;
    }).slice(0, 6); // Limit to 6 users
  });

  postResults = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (q.length < 2) return [];

    return this.dataService.posts().filter(p => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCompany = p.company.toLowerCase().includes(q);
      const matchRole = p.role.toLowerCase().includes(q);
      const matchContent = p.content.toLowerCase().includes(q);
      const matchTag = p.tags.some(t => t.toLowerCase().includes(q));
      
      return matchTitle || matchCompany || matchRole || matchContent || matchTag;
    });
  });
}