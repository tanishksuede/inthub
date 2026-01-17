import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostCardComponent } from '../shared/post-card.component';
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PostCardComponent, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <header class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Recent Experiences</h1>
        
        <!-- Simple Filter -->
        <div class="flex gap-2">
          <select [ngModel]="selectedType()" (ngModelChange)="selectedType.set($event)" class="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500">
            <option value="all">All Types</option>
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
            <option value="system-design">System Design</option>
          </select>
          
          <select [ngModel]="sortOrder()" (ngModelChange)="sortOrder.set($event)" class="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500">
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </header>

      <div class="space-y-2">
        @for (post of filteredPosts(); track post.id) {
          <app-post-card [post]="post"></app-post-card>
        } @empty {
          <div class="text-center py-10 text-gray-500">
            No posts found. Be the first to share!
          </div>
        }
      </div>
    </div>
  `
})
export class HomeComponent {
  dataService = inject(DataService);
  
  selectedType = signal('all');
  sortOrder = signal('latest');

  filteredPosts = computed(() => {
    let posts = [...this.dataService.posts()];
    
    // Filter
    if (this.selectedType() !== 'all') {
      posts = posts.filter(p => p.type === this.selectedType());
    }

    // Sort
    if (this.sortOrder() === 'latest') {
      posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } else {
      posts.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    return posts;
  });
}