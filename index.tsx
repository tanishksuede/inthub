
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './src/app.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, Routes } from '@angular/router';
import { HomeComponent } from './src/components/home/home.component';
import { TrendingComponent } from './src/components/trending/trending.component';
import { CreatePostComponent } from './src/components/create/create-post.component';
import { ProfileComponent } from './src/components/profile/profile.component';
import { CompanyComponent } from './src/components/company/company.component';
import { CollegeFeedComponent } from './src/components/college/college-feed.component';
import { LoginComponent } from './src/components/auth/login.component';
import { SearchComponent } from './src/components/search/search.component';
import { HashtagsComponent } from './src/components/hashtags/hashtags.component';
import { authGuard } from './src/services/data.service';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'trending', component: TrendingComponent, canActivate: [authGuard] },
  { path: 'create', component: CreatePostComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'profile/:id', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'company/:name', component: CompanyComponent, canActivate: [authGuard] },
  { path: 'college/:name', component: CollegeFeedComponent, canActivate: [authGuard] },
  { path: 'search', component: SearchComponent, canActivate: [authGuard] },
  { path: 'hashtags', component: HashtagsComponent, canActivate: [authGuard] },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation())
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
