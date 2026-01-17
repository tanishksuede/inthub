import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DataService, User, Post } from '../../services/data.service';
import { PostCardComponent } from '../shared/post-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCardComponent, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto">
      @if (profileUser(); as user) {
        <!-- Profile Header -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div class="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div class="px-8 pb-6">
            <div class="relative flex justify-between items-end -mt-12 mb-4">
              <img [src]="user.avatarUrl" class="w-24 h-24 rounded-full border-4 border-white bg-white object-cover">
              @if (isOwnProfile()) {
                <button (click)="toggleEdit()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                  {{ isEditing() ? 'Cancel' : 'Edit Profile' }}
                </button>
              } @else {
                 <button (click)="follow()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                  {{ isFollowing() ? 'Unfollow' : 'Follow' }}
                </button>
              }
            </div>

            @if (isEditing()) {
              <div class="space-y-4 mb-4 bg-gray-50 p-4 rounded-lg animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Name</label>
                    <input [(ngModel)]="editForm.name" class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Role</label>
                    <input [(ngModel)]="editForm.role" class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">College</label>
                  <input [(ngModel)]="editForm.college" placeholder="e.g. IIT Bombay" class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Bio</label>
                  <textarea [(ngModel)]="editForm.bio" rows="3" class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Skills (Comma separated)</label>
                  <input [(ngModel)]="editForm.skills" placeholder="e.g. Java, System Design, React" class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"><i class="fa-brands fa-linkedin text-blue-700"></i> LinkedIn URL</label>
                    <input [(ngModel)]="editForm.linkedin" placeholder="https://linkedin.com/in/..." class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"><i class="fa-brands fa-github text-gray-900"></i> GitHub URL</label>
                    <input [(ngModel)]="editForm.github" placeholder="https://github.com/..." class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"><i class="fa-solid fa-code text-orange-500"></i> LeetCode URL</label>
                    <input [(ngModel)]="editForm.leetcode" placeholder="https://leetcode.com/..." class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                  </div>
                   <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"><i class="fa-brands fa-hackerrank text-green-600"></i> HackerRank URL</label>
                    <input [(ngModel)]="editForm.hackerrank" placeholder="https://hackerrank.com/..." class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                  </div>
                </div>

                <button (click)="saveProfile()" class="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">Save Changes</button>
              </div>
            } @else {
              <div class="mb-4">
                <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {{ user.name }}
                  @if (user.id === 'user-5') { <i class="fa-solid fa-circle-check text-blue-500 text-base" title="Verified Prime Minister"></i> }
                </h1>
                
                <p class="text-gray-600 mb-2 flex flex-wrap items-center gap-2">
                  <span>{{ user.role }}</span>
                  <span class="text-gray-300">•</span>
                  @if (user.college) {
                    <a [routerLink]="['/college', user.college]" class="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer" title="View Campus Feed">
                      <i class="fa-solid fa-graduation-cap text-xs"></i>
                      {{ user.college }}
                    </a>
                    <span class="text-gray-300">•</span>
                  }
                  <span>{{ user.email }}</span>
                </p>

                <p class="text-gray-800 mb-4">{{ user.bio }}</p>
                
                <!-- Social Links -->
                <div class="flex items-center gap-3 mb-4">
                  @if (user.linkedin) {
                    <a [href]="user.linkedin" target="_blank" class="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-100 transition-colors" title="LinkedIn">
                      <i class="fa-brands fa-linkedin-in"></i>
                    </a>
                  }
                  @if (user.github) {
                    <a [href]="user.github" target="_blank" class="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center hover:bg-gray-200 transition-colors" title="GitHub">
                      <i class="fa-brands fa-github"></i>
                    </a>
                  }
                  @if (user.leetcode) {
                    <a [href]="user.leetcode" target="_blank" class="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors" title="LeetCode">
                      <i class="fa-solid fa-code"></i>
                    </a>
                  }
                  @if (user.hackerrank) {
                    <a [href]="user.hackerrank" target="_blank" class="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors" title="HackerRank">
                      <i class="fa-brands fa-hackerrank"></i>
                    </a>
                  }
                </div>

                <div class="flex flex-wrap gap-2 mb-6">
                  @for (skill of user.skills; track skill) {
                    <a [routerLink]="['/search']" [queryParams]="{q: skill}" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors cursor-pointer">{{ skill }}</a>
                  }
                </div>
              </div>

              <div class="flex gap-8 border-t border-gray-100 pt-4">
                <div class="text-center">
                  <span class="block text-xl font-bold text-gray-900">{{ userStats()?.postCount || 0 }}</span>
                  <span class="text-xs text-gray-500 uppercase">Posts</span>
                </div>
                <div class="text-center">
                  <span class="block text-xl font-bold text-gray-900">{{ user.followers.length }}</span>
                  <span class="text-xs text-gray-500 uppercase">Followers</span>
                </div>
                <div class="text-center">
                  <span class="block text-xl font-bold text-gray-900">{{ user.following.length }}</span>
                  <span class="text-xs text-gray-500 uppercase">Following</span>
                </div>
              </div>
            }
          </div>
        </div>

        @if (isOwnProfile()) {
           <!-- Analytics Section -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-blue-100 text-blue-600 rounded-lg"><i class="fa-solid fa-eye"></i></div>
                <h3 class="font-semibold text-gray-700">Total Views</h3>
              </div>
              <p class="text-2xl font-bold text-gray-900">{{ userStats()?.views | number }}</p>
              <p class="text-xs text-green-600 flex items-center gap-1"><i class="fa-solid fa-arrow-trend-up"></i> +12% this week</p>
            </div>
            
             <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-red-100 text-red-600 rounded-lg"><i class="fa-solid fa-heart"></i></div>
                <h3 class="font-semibold text-gray-700">Likes Received</h3>
              </div>
              <p class="text-2xl font-bold text-gray-900">{{ userStats()?.totalLikes | number }}</p>
            </div>

             <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-purple-100 text-purple-600 rounded-lg"><i class="fa-regular fa-bookmark"></i></div>
                <h3 class="font-semibold text-gray-700">Saved Items</h3>
              </div>
              <p class="text-2xl font-bold text-gray-900">{{ user.savedPosts.length }}</p>
            </div>
          </div>
        }

        <!-- Tabs -->
        <div class="flex gap-6 border-b border-gray-200 mb-6">
          <button (click)="activeTab.set('posts')" [class.border-blue-600]="activeTab() === 'posts'" [class.text-blue-600]="activeTab() === 'posts'" class="pb-3 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-800 transition-colors">Posts</button>
          @if (isOwnProfile()) {
            <button (click)="activeTab.set('saved')" [class.border-blue-600]="activeTab() === 'saved'" [class.text-blue-600]="activeTab() === 'saved'" class="pb-3 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-800 transition-colors">Saved Collection</button>
          }
        </div>

        <!-- Content List -->
        <div class="space-y-4">
          @if (activeTab() === 'posts') {
            @for (post of userPosts(); track post.id) {
              <app-post-card [post]="post"></app-post-card>
            } @empty {
              <p class="text-gray-500 text-center py-8">No posts yet.</p>
            }
          } @else {
             @for (post of savedPosts(); track post.id) {
              <app-post-card [post]="post"></app-post-card>
            } @empty {
               <p class="text-gray-500 text-center py-8">You haven't saved any posts yet.</p>
            }
          }
        </div>
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  dataService = inject(DataService);
  route = inject(ActivatedRoute);

  profileId = signal<string | null>(null);
  activeTab = signal<'posts' | 'saved'>('posts');
  isEditing = signal(false);
  
  editForm = { 
    name: '', 
    bio: '', 
    role: '',
    college: '',
    skills: '',
    linkedin: '',
    github: '',
    leetcode: '',
    hackerrank: ''
  };

  currentUser = this.dataService.currentUser;
  
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.profileId.set(id);
    });
  }

  isOwnProfile = computed(() => {
    return !this.profileId() || this.profileId() === this.currentUser()?.id;
  });

  profileUser = computed(() => {
    if (this.isOwnProfile()) return this.currentUser();
    return this.dataService.users().find(u => u.id === this.profileId()) || null;
  });

  isFollowing = computed(() => {
    const targetId = this.profileUser()?.id;
    if (!targetId || !this.currentUser()) return false;
    return this.currentUser()!.following.includes(targetId);
  });

  userPosts = computed(() => {
    const uid = this.profileUser()?.id;
    if (!uid) return [];
    return this.dataService.posts().filter(p => p.authorId === uid);
  });
  
  savedPosts = computed(() => {
     if (!this.isOwnProfile()) return [];
     const savedIds = this.currentUser()?.savedPosts || [];
     return this.dataService.posts().filter(p => savedIds.includes(p.id));
  });

  userStats = computed(() => {
     if (this.isOwnProfile()) return this.dataService.userStats();
     
     const uid = this.profileUser()?.id;
     if (!uid) return null;
     const posts = this.dataService.posts().filter(p => p.authorId === uid);
     return {
       postCount: posts.length,
       totalLikes: posts.reduce((a,b) => a + b.likedBy.length, 0),
       totalComments: 0,
       views: 0
     };
  });

  toggleEdit() {
    if (!this.isEditing()) {
      const u = this.currentUser()!;
      this.editForm = { 
        name: u.name, 
        bio: u.bio, 
        role: u.role,
        college: u.college || '',
        skills: u.skills.join(', '),
        linkedin: u.linkedin || '',
        github: u.github || '',
        leetcode: u.leetcode || '',
        hackerrank: u.hackerrank || ''
      };
    }
    this.isEditing.update(v => !v);
  }

  saveProfile() {
    const skillsArray = this.editForm.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.dataService.updateProfile({
      ...this.editForm,
      skills: skillsArray
    });
    this.isEditing.set(false);
  }

  follow() {
    const uid = this.profileUser()?.id;
    if (uid) this.dataService.toggleFollow(uid);
  }
}