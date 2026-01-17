import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-hashtags',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Popular Topics</h1>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @for (tag of topTags(); track tag.name) {
          <a [routerLink]="['/search']" [queryParams]="{q: tag.name}" class="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">#</div>
            <h2 class="font-bold text-gray-800 text-lg mb-1">{{ tag.name }}</h2>
            <p class="text-sm text-gray-500">{{ tag.count }} Posts</p>
          </a>
        }
      </div>
    </div>
  `
})
export class HashtagsComponent {
  dataService = inject(DataService);

  topTags = computed(() => {
    const posts = this.dataService.posts();
    const tagMap = new Map<string, number>();

    posts.forEach(p => {
      p.tags.forEach(t => {
        const tag = t.toLowerCase();
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  });
}