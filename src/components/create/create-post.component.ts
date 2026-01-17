import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AiService } from '../../services/ai.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Share Experience</h1>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input [(ngModel)]="form.title" placeholder="e.g. SDE Intern On-Campus Experience" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input [(ngModel)]="form.company" placeholder="Company Name" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
             <input [(ngModel)]="form.role" placeholder="e.g. Summer Analyst" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Experience Details</label>
          <div class="relative">
            <textarea 
              [(ngModel)]="form.content" 
              (keydown.tab)="acceptSuggestion($event)"
              rows="6" 
              placeholder="Describe the OA rounds, difficulty, topics covered, and advice for juniors..." 
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            ></textarea>
            
            <!-- AI Toolbar -->
            <div class="absolute bottom-2 right-2 flex gap-2">
               <button (click)="getSuggestion()" [disabled]="loadingAi()" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1">
                 <i class="fa-solid fa-wand-magic-sparkles"></i> 
                 {{ loadingAi() ? 'Thinking...' : 'Predict Next' }}
               </button>
               
               <button (click)="improveText()" [disabled]="loadingAi()" class="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100 flex items-center gap-1">
                 <i class="fa-solid fa-spell-check"></i> 
                 {{ loadingAi() ? 'Improving...' : 'Fix Grammar & Flow' }}
               </button>
            </div>
          </div>
           @if (suggestion()) {
            <div class="mt-1 text-sm text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
              <span class="font-bold text-gray-400">Suggestion:</span> {{ suggestion() }}
              <button (click)="applySuggestion()" class="ml-2 text-blue-600 font-semibold hover:underline">Apply (Tab)</button>
            </div>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Interview Questions</label>
          <textarea [(ngModel)]="form.questions" rows="4" placeholder="List specific OA or interview questions asked..." class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select [(ngModel)]="form.type" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="general">General</option>
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
            <option value="system-design">System Design</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <input type="checkbox" id="anon" [(ngModel)]="form.isAnonymous" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
          <label for="anon" class="text-sm font-medium text-gray-700 select-none">Post Anonymously (Hide my name and profile)</label>
        </div>

        <div class="pt-4 flex justify-end gap-3">
          <button routerLink="/home" class="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
          <button (click)="submit()" class="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md">Post Experience</button>
        </div>
      </div>
    </div>
  `
})
export class CreatePostComponent {
  dataService = inject(DataService);
  aiService = inject(AiService);
  toast = inject(ToastService);
  router = inject(Router);

  form = {
    title: '',
    company: '',
    role: '',
    content: '',
    questions: '',
    type: 'general' as const,
    isAnonymous: false
  };

  suggestion = signal('');
  loadingAi = signal(false);

  async getSuggestion() {
    if (!this.form.content) return;
    this.loadingAi.set(true);
    const pred = await this.aiService.predictNextLine(this.form.content);
    this.suggestion.set(pred);
    this.loadingAi.set(false);
  }

  acceptSuggestion(e: Event) {
    if (this.suggestion()) {
      e.preventDefault();
      this.applySuggestion();
    }
  }

  applySuggestion() {
    this.form.content += ' ' + this.suggestion();
    this.suggestion.set('');
  }

  async improveText() {
    if (!this.form.content) return;
    this.loadingAi.set(true);
    const improved = await this.aiService.improveText(this.form.content);
    if (improved) {
        this.form.content = improved;
        this.toast.show('Text improved by AI!', 'success');
    }
    this.loadingAi.set(false);
  }

  submit() {
    if (!this.form.title || !this.form.company || !this.form.content) {
      this.toast.show('Please fill in required fields', 'error');
      return;
    }
    
    this.dataService.addPost({
      ...this.form,
      tags: [this.form.company.toLowerCase(), this.form.role.toLowerCase(), this.form.type]
    });
    
    this.toast.show('Experience shared successfully!', 'success');
    this.router.navigate(['/home']);
  }
}