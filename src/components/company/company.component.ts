import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AiService } from '../../services/ai.service';
import { PostCardComponent } from '../shared/post-card.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, PostCardComponent, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
              {{ companyName()?.charAt(0) }}
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ companyName() }}</h1>
              <p class="text-gray-500">{{ companyPosts().length }} Interview Experiences</p>
            </div>
          </div>
          <button (click)="generateSummary()" [disabled]="loadingSummary()" class="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center gap-2">
            <i class="fa-solid fa-robot"></i> 
            {{ loadingSummary() ? 'Analyzing...' : 'AI Summary' }}
          </button>
        </div>

        @if (summaryHtml()) {
          <div class="bg-purple-50 p-4 rounded-lg border border-purple-100 animate-fade-in">
            <h3 class="font-bold text-purple-900 mb-2 flex items-center gap-2">
              <i class="fa-solid fa-sparkles"></i> AI Insights
            </h3>
            <div [innerHTML]="summaryHtml()" class="prose prose-sm prose-purple"></div>
          </div>
        }
      </div>

      <!-- Filters -->
      <div class="flex gap-4 mb-4">
        <select [ngModel]="roleFilter()" (ngModelChange)="roleFilter.set($event)" class="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="all">All Roles</option>
          <option value="Frontend Engineer">Frontend</option>
          <option value="Backend Engineer">Backend</option>
          <option value="Product Manager">Product Manager</option>
        </select>
      </div>

      <div class="space-y-4">
        @for (post of filteredPosts(); track post.id) {
          <app-post-card [post]="post"></app-post-card>
        } @empty {
           <p class="text-gray-500 text-center py-10">No experiences found for this filter.</p>
        }
      </div>
    </div>
  `
})
export class CompanyComponent implements OnInit {
  route = inject(ActivatedRoute);
  dataService = inject(DataService);
  aiService = inject(AiService);

  companyName = signal<string>('');
  roleFilter = signal('all');
  summaryHtml = signal('');
  loadingSummary = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.companyName.set(params.get('name') || '');
      this.summaryHtml.set(''); // Reset summary on nav
    });
  }

  companyPosts = computed(() => {
    return this.dataService.posts().filter(p => 
      p.company.toLowerCase() === this.companyName().toLowerCase()
    );
  });

  filteredPosts = computed(() => {
    let posts = this.companyPosts();
    if (this.roleFilter() !== 'all') {
      posts = posts.filter(p => p.role.includes(this.roleFilter()));
    }
    return posts;
  });

  async generateSummary() {
    this.loadingSummary.set(true);
    const texts = this.companyPosts().map(p => p.content).slice(0, 10); // Limit to 10 for tokens
    const summary = await this.aiService.summarizeCompany(texts, this.companyName());
    this.summaryHtml.set(summary);
    this.loadingSummary.set(false);
  }
}