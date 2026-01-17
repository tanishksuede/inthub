import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { PostCardComponent } from '../shared/post-card.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-college-feed',
  standalone: true,
  imports: [CommonModule, PostCardComponent, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 relative overflow-hidden">
        <!-- Decorative Background -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
        
        <div class="relative z-10">
          <span class="text-sm font-semibold text-blue-600 uppercase tracking-wide">Campus Feed</span>
          <h1 class="text-4xl font-bold text-gray-900 mt-2 mb-2">{{ collegeName() }}</h1>
          <p class="text-gray-600 text-lg">
            Connect with seniors and alumni. Discover <span class="font-bold text-gray-800">{{ collegePosts().length }}</span> shared experiences.
          </p>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-4">
        @for (post of collegePosts(); track post.id) {
          <app-post-card [post]="post"></app-post-card>
        } @empty {
           <div class="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
             <div class="text-gray-300 text-5xl mb-4"><i class="fa-solid fa-graduation-cap"></i></div>
             <p class="text-gray-500 text-lg font-medium">No experiences shared from {{ collegeName() }} yet.</p>
             <p class="text-gray-400 text-sm mt-1">Be the first to share!</p>
           </div>
        }
      </div>
    </div>
  `
})
export class CollegeFeedComponent implements OnInit {
  route = inject(ActivatedRoute);
  dataService = inject(DataService);

  collegeName = signal<string>('');

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.collegeName.set(params.get('name') || '');
    });
  }

  collegePosts = computed(() => {
    const targetCollege = this.collegeName();
    if (!targetCollege) return [];

    // 1. Find all users from this college
    const collegeUserIds = this.dataService.users()
        .filter(u => u.college === targetCollege)
        .map(u => u.id);

    // 2. Filter posts authored by these users
    // Also including a little logic to filter by name if authorId lookup is complex, 
    // but since we have authorId in post, it's efficient.
    return this.dataService.posts().filter(p => collegeUserIds.includes(p.authorId));
  });
}