import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostCardComponent } from '../shared/post-card.component';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-6 bg-gradient-to-r from-orange-100 to-amber-50 p-6 rounded-2xl border border-orange-200">
        <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <i class="fa-solid fa-fire text-orange-500"></i> Trending Now
        </h1>
        <p class="text-gray-600">The most discussed interview experiences this week.</p>
      </div>

      <div class="space-y-2">
        @for (post of trendingPosts(); track post.id) {
          <app-post-card [post]="post"></app-post-card>
        }
      </div>
    </div>
  `
})
export class TrendingComponent {
  dataService = inject(DataService);

  trendingPosts = computed(() => {
    // Sort by likes (array length) + comments count descending
    return [...this.dataService.posts()]
      .sort((a, b) => (b.likedBy.length + b.comments.length) - (a.likedBy.length + a.comments.length))
      .slice(0, 20); // Top 20
  });
}