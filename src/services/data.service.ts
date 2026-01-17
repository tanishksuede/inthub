import { Injectable, signal, computed, inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  role: string;
  college?: string; // Added college field
  company?: string;
  skills: string[];
  avatarUrl: string;
  followers: string[]; // User IDs
  following: string[]; // User IDs
  savedPosts: string[]; // Post IDs
  isAdmin?: boolean;
  // Social Links
  linkedin?: string;
  github?: string;
  leetcode?: string;
  hackerrank?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  company: string;
  role: string;
  content: string;
  questions: string; // Separate section for questions
  timestamp: Date;
  likedBy: string[]; // Changed from number to array of user IDs
  comments: Comment[];
  tags: string[];
  type: 'behavioral' | 'technical' | 'system-design' | 'general';
  isAnonymous?: boolean; // Support for anonymous posts
}

export interface Comment {
  id: string;
  authorId: string; // Added authorId for permission checks
  authorName: string;
  text: string;
  timestamp: Date;
}

export const authGuard: CanActivateFn = () => {
  const service = inject(DataService);
  const router = inject(Router);
  if (service.currentUser()) return true;
  return router.createUrlTree(['/login']);
};

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // State Signals
  currentUser = signal<User | null>(null);
  posts = signal<Post[]>([]);
  users = signal<User[]>([]); // Mock user DB
  
  // Analytics mocked via computed/signals
  userStats = computed(() => {
    const user = this.currentUser();
    if (!user) return null;
    const userPosts = this.posts().filter(p => p.authorId === user.id);
    const totalLikes = userPosts.reduce((acc, p) => acc + p.likedBy.length, 0);
    const totalComments = userPosts.reduce((acc, p) => acc + p.comments.length, 0);
    return {
      postCount: userPosts.length,
      totalLikes,
      totalComments,
      views: userPosts.length * 153 // Mock multiplier
    };
  });

  constructor(private router: Router) {
    this.seedData();
  }

  login(email: string) {
    // Simple mock login - finds first user or creates dummy
    const user = this.users().find(u => u.email === email) || this.users()[0];
    this.currentUser.set(user);
    this.router.navigate(['/home']);
  }

  logout() {
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  register(name: string, email: string) {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      bio: 'Ready to learn and help juniors!',
      role: 'Student',
      college: 'IIT Bombay', // Default for new users in mock
      skills: [],
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      followers: [],
      following: [],
      savedPosts: []
    };
    this.users.update(u => [...u, newUser]);
    this.currentUser.set(newUser);
    this.router.navigate(['/home']);
  }

  updateProfile(updates: Partial<User>) {
    this.currentUser.update(u => u ? { ...u, ...updates } : null);
    // Sync to user list
    this.users.update(users => users.map(u => u.id === this.currentUser()?.id ? this.currentUser()! : u));
  }

  toggleSavePost(postId: string) {
    const user = this.currentUser();
    if (!user) return;
    const isSaved = user.savedPosts.includes(postId);
    const newSaved = isSaved 
      ? user.savedPosts.filter(id => id !== postId)
      : [...user.savedPosts, postId];
    
    this.updateProfile({ savedPosts: newSaved });
  }

  toggleFollow(targetUserId: string) {
    const me = this.currentUser();
    if (!me || me.id === targetUserId) return;

    const isFollowing = me.following.includes(targetUserId);
    const newFollowing = isFollowing
      ? me.following.filter(id => id !== targetUserId)
      : [...me.following, targetUserId];

    this.updateProfile({ following: newFollowing });
  }

  addPost(post: Omit<Post, 'id' | 'timestamp' | 'likedBy' | 'comments' | 'authorId' | 'authorName' | 'authorAvatar'> & { isAnonymous?: boolean }) {
    const user = this.currentUser();
    if (!user) return;
    
    const newPost: Post = {
      ...post,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      likedBy: [],
      comments: [],
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatarUrl,
      isAnonymous: post.isAnonymous || false
    };

    this.posts.update(p => [newPost, ...p]);
  }

  deletePost(postId: string) {
    this.posts.update(posts => posts.filter(p => p.id !== postId));
  }

  likePost(postId: string) {
    const userId = this.currentUser()?.id;
    if (!userId) return; // Must be logged in

    this.posts.update(posts => posts.map(p => {
      if (p.id === postId) {
        const isLiked = p.likedBy.includes(userId);
        const newLikedBy = isLiked 
          ? p.likedBy.filter(id => id !== userId) // Unlike
          : [...p.likedBy, userId]; // Like
        return { ...p, likedBy: newLikedBy };
      }
      return p;
    }));
  }

  addComment(postId: string, text: string) {
    const user = this.currentUser();
    if (!user) return;
    
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: user.id,
      authorName: user.name,
      text,
      timestamp: new Date()
    };

    this.posts.update(posts => posts.map(p => {
      if (p.id === postId) return { ...p, comments: [...p.comments, newComment] };
      return p;
    }));
  }

  deleteComment(postId: string, commentId: string) {
    this.posts.update(posts => posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: p.comments.filter(c => c.id !== commentId) };
      }
      return p;
    }));
  }

  private seedData() {
    // 1. Seed Users: Students, Alumni, and Seniors
    const colleges = ['IIT Bombay', 'BITS Pilani', 'DTU', 'NIT Trichy', 'IIIT Hyderabad', 'Manipal', 'VIT'];
    
    const realUsers = [
      { name: 'Reva', role: 'Final Year CSE', bio: 'Placed at Microsoft. Here to help juniors with DSA and core subjects.', avatar: 'https://i.pravatar.cc/150?u=reva' },
      { name: 'Palak', role: 'SDE Intern', bio: 'Incoming Summer Analyst @ Goldman Sachs. Ask me about OA patterns.', avatar: 'https://i.pravatar.cc/150?u=palak' },
      { name: 'Anay', role: 'Competitive Coder', bio: 'CP Enthusiast. 5* on CodeChef. Solving LeetCode hards for fun.', avatar: 'https://i.pravatar.cc/150?u=anay' },
      { name: 'Tanishk', role: 'AI Research Intern', bio: 'Working on LLMs. Guide for research internships and Masters.', avatar: 'https://i.pravatar.cc/150?u=tanishk' },
      { name: 'Dhakad Sahab', role: 'Placement Coordinator', bio: 'Managing campus drives. Contact for schedule updates.', avatar: 'https://i.pravatar.cc/150?u=dhakad' },
      { name: 'Aryan', role: 'Alumni \'23', bio: 'Working at Google. Helping batchmates crack off-campus.', avatar: 'https://i.pravatar.cc/150?u=aryan' },
      { name: 'Ishita', role: 'UI/UX Lead', bio: 'Design Club Head. Portfolios and Frontend interviews.', avatar: 'https://i.pravatar.cc/150?u=ishita' },
      { name: 'Kabir', role: 'Open Source Dev', bio: 'GSoC Mentor. Skipping placements for startups.', avatar: 'https://i.pravatar.cc/150?u=kabir' },
      { name: 'Meera', role: 'MBA Aspirant', bio: 'Cracked CAT. Tips for non-tech roles in tech companies.', avatar: 'https://i.pravatar.cc/150?u=meera' },
      { name: 'Dev', role: 'ECE Student', bio: 'Cracking software roles from non-CS branch. Coding + Electronics.', avatar: 'https://i.pravatar.cc/150?u=dev' },
      { name: 'Rohan', role: 'Batch \'25', bio: 'Searching for internships. Learning React.', avatar: 'https://i.pravatar.cc/150?u=rohan' },
      { name: 'Sanya', role: 'Data Science Lead', bio: 'President of AI/ML Club. Hosting workshops.', avatar: 'https://i.pravatar.cc/150?u=sanya' }
    ];

    const users: User[] = realUsers.map((u, i) => ({
      id: `user-${i}`,
      name: u.name,
      email: `${u.name.toLowerCase().replace(' ', '')}@college.edu`,
      bio: u.bio,
      role: u.role,
      college: colleges[i % colleges.length],
      skills: ['Java', 'C++', 'Python', 'System Design'],
      avatarUrl: u.avatar,
      followers: [],
      following: [],
      savedPosts: [],
      linkedin: `https://linkedin.com/in/${u.name.toLowerCase().replace(' ', '')}`,
      github: `https://github.com/${u.name.toLowerCase().replace(' ', '')}`
    }));
    this.users.set(users);

    // 2. Seed Posts: Campus and Student focused content
    const companies = ['Google', 'Amazon', 'Microsoft', 'Goldman Sachs', 'JPMC', 'Deutsche Bank', 'Oracle', 'Cisco', 'Salesforce', 'Uber', 'Atlassian', 'Samsung', 'Adobe', 'Flipkart', 'Paytm'];
    
    const roles = [
      'SDE Intern', 'Summer Analyst', 'FTE (Full Time)', 'Graduate Engineer Trainee', 'Analyst',
      'Research Intern', 'Quant Strategist', 'Consultant', 'Product Intern', 'Data Science Intern',
      'Backend Intern', 'Frontend Intern', 'Campus Ambassador'
    ];
    
    const types = ['behavioral', 'technical', 'system-design', 'general'] as const;
    
    const posts: Post[] = Array.from({ length: 100 }).map((_, i) => {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const userIndex = i % users.length;
      
      const intros = [
        "Hey juniors, just wanted to share my on-campus experience.",
        "For everyone sitting for the upcoming drive, here is what they asked.",
        "My interview experience for the summer internship program.",
        "Recently cracked the off-campus drive, here are my notes.",
        "Tips for the OA round that is scheduled for tomorrow."
      ];
      
      const intro = intros[Math.floor(Math.random() * intros.length)];

      return {
        id: `post-${i}`,
        authorId: users[userIndex].id,
        authorName: users[userIndex].name,
        authorAvatar: users[userIndex].avatarUrl,
        title: `${role} @ ${company} - ${type === 'technical' ? 'OA + Interview' : 'Experience'}`,
        company,
        role,
        type,
        content: `${intro}\n\nThe process had 3 rounds. Round 1 was an Online Assessment on HackerRank with 2 coding questions (DP and Graph). \n\nRound 2 was Technical Interview focused on ${type} concepts. They asked about projects and some core CS subjects like OS and DBMS.\n\nRound 3 was HR/Managerial. Be confident and know your resume well. Good luck to everyone applying!`,
        questions: `1. Find the largest rectangle in a histogram.\n2. Difference between Process and Thread.\n3. Why do you want to join ${company}?`,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Random time in past
        likedBy: Array.from({ length: Math.floor(Math.random() * 20) }).map((_, k) => `user-${k}`), // Mock likes
        comments: [],
        tags: [company.toLowerCase(), role.toLowerCase().replace(' ', '-'), type, 'on-campus', 'freshers'],
        isAnonymous: Math.random() > 0.9 // Randomly assign some anonymous posts for testing
      };
    });
    
    // Sort initially by date desc
    posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    this.posts.set(posts);
  }
}