import { Component, input, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Post, Comment, DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FormsModule],
  template: `
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4 hover:shadow-md transition-all">
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <img 
            [src]="post().isAnonymous ? 'https://ui-avatars.com/api/?name=Anonymous&background=gray&color=fff' : post().authorAvatar" 
            class="w-10 h-10 rounded-full object-cover border border-gray-100" 
            alt="Avatar"
          >
          <div>
            <div class="flex items-center gap-2">
              @if (post().isAnonymous) {
                <span class="font-semibold text-gray-900 text-sm">Anonymous User</span>
              } @else {
                <h3 class="font-semibold text-gray-900 text-sm hover:underline cursor-pointer" [routerLink]="['/profile', post().authorId]">{{ post().authorName }}</h3>
              }
              
              @if (!post().isAnonymous) {
                @if (isFollowing()) {
                  <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Following</span>
                } @else if (post().authorId !== currentUser()?.id) {
                  <button (click)="followUser()" class="text-xs text-blue-600 font-medium hover:text-blue-800">Follow</button>
                }
              }
            </div>
            <p class="text-xs text-gray-500">
              {{ post().timestamp | date:'mediumDate' }} • 
              <a [routerLink]="['/search']" [queryParams]="{q: post().role}" class="hover:underline text-gray-700 font-medium">{{ post().role }}</a> 
              @ 
              <a [routerLink]="['/company', post().company]" class="hover:underline text-blue-600">{{ post().company }}</a>
            </p>
          </div>
        </div>
        
        <!-- Menu -->
        <div class="relative">
           @if (currentUser()?.id === post().authorId) {
             <button (click)="deletePost()" class="text-gray-400 hover:text-red-500 p-1" title="Delete Post">
                <i class="fa-solid fa-trash"></i>
             </button>
           }
        </div>
      </div>

      <!-- Content -->
      <div class="mb-4">
        <h2 class="text-lg font-bold text-gray-900 mb-2">{{ post().title }}</h2>
        <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-line mb-3">
          {{ isExpanded() ? post().content : (post().content | slice:0:200) + '...' }}
          @if (post().content.length > 200) {
            <button (click)="toggleExpand()" class="text-blue-600 hover:underline text-sm font-medium">
              {{ isExpanded() ? 'Show Less' : 'Read More' }}
            </button>
          }
        </div>

        <!-- Questions Section -->
         @if (post().questions) {
          <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-3">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Interview Questions</h4>
            <pre class="whitespace-pre-wrap text-sm text-gray-800 font-mono">{{ post().questions }}</pre>
          </div>
         }

        <!-- Tags -->
        <div class="flex flex-wrap gap-2 mt-3">
          @for (tag of post().tags; track tag) {
            <a [routerLink]="['/search']" [queryParams]="{q: tag}" class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full cursor-pointer hover:bg-blue-100 hover:text-blue-900 transition-colors">#{{ tag }}</a>
          }
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between border-t border-gray-100 pt-3">
        <div class="flex gap-4">
          <button (click)="like()" [class.text-red-500]="isLiked()" class="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors group">
            <i [class]="isLiked() ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
            <span class="text-sm font-medium">{{ post().likedBy.length }}</span>
          </button>
          
          <button (click)="toggleComments()" class="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors">
            <i class="fa-regular fa-comment"></i>
            <span class="text-sm font-medium">{{ post().comments.length }}</span>
          </button>

          <button (click)="share()" class="flex items-center gap-1.5 text-gray-500 hover:text-green-500 transition-colors">
            <i class="fa-solid fa-share"></i>
          </button>
        </div>

        <div class="flex gap-3">
           <button (click)="toggleSave()" [class.text-yellow-500]="isSaved()" class="text-gray-400 hover:text-yellow-500 transition-colors" title="Save">
            <i [class]="isSaved() ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'"></i>
          </button>
          <button (click)="openReportModal('Post', post().id)" class="text-gray-400 hover:text-red-600 transition-colors" title="Report">
            <i class="fa-regular fa-flag"></i>
          </button>
        </div>
      </div>

      <!-- Comments Section -->
      @if (showComments()) {
        <div class="mt-4 pt-3 border-t border-gray-100 animate-fade-in">
          <div class="flex gap-2 mb-3">
            <input #commentInput type="text" placeholder="Write a comment..." class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button (click)="postComment(commentInput.value); commentInput.value=''" class="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700">Post</button>
          </div>
          <div class="space-y-3">
            @for (comment of post().comments; track comment.id) {
              <div class="bg-gray-50 p-2 rounded text-sm relative group">
                <div class="flex justify-between items-start">
                   <div>
                     <span class="font-semibold text-gray-900 block text-xs mb-1">{{ comment.authorName }}</span>
                     <p class="text-gray-700">{{ comment.text }}</p>
                   </div>
                   
                   <!-- Comment Actions -->
                   <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     @if (canDeleteComment(comment)) {
                       <button (click)="deleteComment(comment.id)" class="text-gray-400 hover:text-red-500 text-xs" title="Delete Comment">
                         <i class="fa-solid fa-trash"></i>
                       </button>
                     }
                     <button (click)="openReportModal('Comment', comment.id)" class="text-gray-400 hover:text-red-500 text-xs" title="Report Comment">
                        <i class="fa-regular fa-flag"></i>
                     </button>
                   </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Report Modal -->
    @if (showReportModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-2xl animate-bounce-in">
          <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
            <h3 class="font-bold text-gray-900">Report {{ reportTargetType() }}</h3>
            <button (click)="showReportModal.set(false)" class="text-gray-400 hover:text-gray-600"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="p-6">
            <p class="text-sm text-gray-600 mb-4">Why are you flagging this content?</p>
            <div class="space-y-2">
              <button (click)="submitReport('Spam')" class="w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50 text-sm font-medium">It's spam</button>
              <button (click)="submitReport('Harassment')" class="w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50 text-sm font-medium">Hate speech or harassment</button>
              <button (click)="submitReport('Misinformation')" class="w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50 text-sm font-medium">False information</button>
              <button (click)="submitReport('Other')" class="w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50 text-sm font-medium">Something else</button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class PostCardComponent {
  post = input.required<Post>();
  dataService = inject(DataService);
  toast = inject(ToastService);
  
  isExpanded = signal(false);
  showComments = signal(false);
  showReportModal = signal(false);
  reportTargetType = signal<'Post' | 'Comment'>('Post');
  reportTargetId = signal<string>('');

  currentUser = this.dataService.currentUser;

  isSaved() {
    return this.currentUser()?.savedPosts.includes(this.post().id);
  }

  isFollowing() {
    return this.currentUser()?.following.includes(this.post().authorId);
  }

  isLiked = computed(() => {
    const uid = this.currentUser()?.id;
    return uid ? this.post().likedBy.includes(uid) : false;
  });

  toggleExpand() {
    this.isExpanded.update(v => !v);
  }

  toggleComments() {
    this.showComments.update(v => !v);
  }

  like() {
    this.dataService.likePost(this.post().id);
  }

  postComment(text: string) {
    if (!text.trim()) return;
    this.dataService.addComment(this.post().id, text);
    this.toast.show('Comment added!', 'success');
  }

  toggleSave() {
    this.dataService.toggleSavePost(this.post().id);
    const msg = this.isSaved() ? 'Post removed from saved.' : 'Post saved!';
    this.toast.show(msg, 'success');
  }

  followUser() {
    this.dataService.toggleFollow(this.post().authorId);
    this.toast.show(`Followed ${this.post().authorName}`, 'success');
  }

  openReportModal(type: 'Post' | 'Comment', id: string) {
    this.reportTargetType.set(type);
    this.reportTargetId.set(id);
    this.showReportModal.set(true);
  }

  submitReport(reason: string) {
    this.toast.show(`${this.reportTargetType()} reported for ${reason}. We will review it shortly.`, 'success');
    this.showReportModal.set(false);
  }

  deletePost() {
    if(confirm('Are you sure you want to delete this post?')) {
      this.dataService.deletePost(this.post().id);
      this.toast.show('Post deleted.', 'success');
    }
  }

  share() {
    navigator.clipboard.writeText(window.location.origin + '/#/home?post=' + this.post().id);
    this.toast.show('Link copied to clipboard!', 'success');
  }

  canDeleteComment(comment: Comment): boolean {
    const uid = this.currentUser()?.id;
    if (!uid) return false;
    // Allow delete if: user is comment author OR user is post author
    return comment.authorId === uid || this.post().authorId === uid;
  }

  deleteComment(commentId: string) {
    if (confirm('Delete this comment?')) {
      this.dataService.deleteComment(this.post().id, commentId);
      this.toast.show('Comment deleted', 'success');
    }
  }
}