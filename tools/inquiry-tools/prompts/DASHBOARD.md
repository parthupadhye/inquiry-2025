# PROMPT: Research Dashboard — Angular + Vercel + GitHub OAuth

## Target
`inquiry-research` repo at `C:\Users\parth\einquiry-research`

## Instructions
- Create all files directly without asking for confirmation
- Save files to: `C:\Users\parth\einquiry-research\`
- Do not ask "Would you like me to create this file?" — just create it
- This is a complete Angular 17+ application with Vercel serverless functions

## Overview
Create a research dashboard that:
1. Authenticates via GitHub OAuth (whitelist: parth-einquiry only)
2. Provides buttons to create research documents from templates
3. Links to GitHub for editing existing files
4. Deploys on Vercel

---

## Files to Create

### 1. package.json

```json
{
  "name": "inquiry-research",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "vercel-build": "ng build --configuration production"
  },
  "dependencies": {
    "@angular/animations": "^17.3.0",
    "@angular/common": "^17.3.0",
    "@angular/compiler": "^17.3.0",
    "@angular/core": "^17.3.0",
    "@angular/forms": "^17.3.0",
    "@angular/platform-browser": "^17.3.0",
    "@angular/platform-browser-dynamic": "^17.3.0",
    "@angular/router": "^17.3.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.6.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^17.3.0",
    "@angular/cli": "^17.3.0",
    "@angular/compiler-cli": "^17.3.0",
    "@types/node": "^20.0.0",
    "typescript": "~5.4.0"
  }
}
```

### 2. angular.json

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "inquiry-research": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/inquiry-research",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.css"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                { "type": "initial", "maximumWarning": "500kb", "maximumError": "1mb" },
                { "type": "anyComponentStyle", "maximumWarning": "2kb", "maximumError": "4kb" }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": { "buildTarget": "inquiry-research:build:production" },
            "development": { "buildTarget": "inquiry-research:build:development" }
          },
          "defaultConfiguration": "development"
        }
      }
    }
  }
}
```

### 3. tsconfig.json

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "paths": {
      "@app/*": ["./src/app/*"],
      "@env/*": ["./src/environments/*"]
    }
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

### 4. tsconfig.app.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
```

### 5. vercel.json

```json
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "dist/inquiry-research/browser",
  "framework": null,
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@3"
    }
  }
}
```

### 6. src/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Inquiry Research</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

### 7. src/styles.css

```css
:root {
  --color-coral: #FF6B6B;
  --color-blue: #4ECDC4;
  --color-olive: #95A844;
  --color-dark: #1a1a2e;
  --color-gray: #6b7280;
  --color-light: #f3f4f6;
  --color-white: #ffffff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--color-light);
  color: var(--color-dark);
  line-height: 1.6;
}

button {
  cursor: pointer;
  font-family: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}
```

### 8. src/main.ts

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
}).catch((err) => console.error(err));
```

### 9. src/app/app.component.ts

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}
```

### 10. src/app/app.routes.ts

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'callback',
    loadComponent: () => import('./pages/callback/callback.component').then(m => m.CallbackComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
```

### 11. src/app/services/auth.service.ts

```typescript
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface User {
  login: string;
  avatar_url: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  isAuthenticated = signal(false);
  isLoading = signal(true);
  user = signal<User | null>(null);

  async checkAuth(): Promise<boolean> {
    try {
      const user = await firstValueFrom(this.http.get<User>('/api/auth/me'));
      this.user.set(user);
      this.isAuthenticated.set(true);
      return true;
    } catch {
      this.isAuthenticated.set(false);
      this.user.set(null);
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  login(): void {
    window.location.href = '/api/auth/login';
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post('/api/auth/logout', {}));
    } finally {
      this.isAuthenticated.set(false);
      this.user.set(null);
      window.location.href = '/login';
    }
  }
}
```

### 12. src/app/services/research.service.ts

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type DocType = 'domain' | 'industry' | 'spec' | 'eval' | 'pilot' | 'finding';

export interface CreateDocRequest {
  type: DocType;
  title: string;
  folder?: string;
  agent?: string;
  version?: string;
}

export interface CreateDocResponse {
  success: boolean;
  path: string;
  editUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ResearchService {
  private http = inject(HttpClient);

  private readonly REPO_OWNER = 'parth-einquiry';
  private readonly REPO_NAME = 'inquiry-research';

  async createDocument(request: CreateDocRequest): Promise<CreateDocResponse> {
    return firstValueFrom(
      this.http.post<CreateDocResponse>('/api/create', request)
    );
  }

  getEditUrl(path: string): string {
    return `https://github.com/${this.REPO_OWNER}/${this.REPO_NAME}/edit/main/${path}`;
  }

  getViewUrl(path: string): string {
    return `https://github.com/${this.REPO_OWNER}/${this.REPO_NAME}/blob/main/${path}`;
  }

  getFolderUrl(path: string): string {
    return `https://github.com/${this.REPO_OWNER}/${this.REPO_NAME}/tree/main/${path}`;
  }
}
```

### 13. src/app/guards/auth.guard.ts

```typescript
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await authService.checkAuth();

  if (!isAuthenticated) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
```

### 14. src/app/interceptors/auth.interceptor.ts

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Cookies are sent automatically, but we can add headers if needed
  const authReq = req.clone({
    withCredentials: true,
  });
  return next(authReq);
};
```

### 15. src/app/pages/login/login.component.ts

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo">
          <span class="logo-e">e</span><span class="logo-i">ï</span>
        </div>
        <h1>Inquiry Research</h1>
        <p>Sign in to access the research dashboard</p>
        
        @if (error) {
          <div class="error">{{ error }}</div>
        }
        
        <button class="login-btn" (click)="login()">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Sign in with GitHub
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }
    
    .login-card {
      background: white;
      padding: 3rem;
      border-radius: 1rem;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-width: 400px;
      width: 90%;
    }
    
    .logo {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    .logo-e { color: var(--color-coral); }
    .logo-i { color: var(--color-blue); }
    
    h1 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: var(--color-dark);
    }
    
    p {
      color: var(--color-gray);
      margin-bottom: 2rem;
    }
    
    .error {
      background: #fee2e2;
      color: #dc2626;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    
    .login-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--color-dark);
      color: white;
      border: none;
      padding: 0.875rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .login-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.5);
    }
  `],
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  error = '';

  ngOnInit(): void {
    // Check if already authenticated
    this.authService.checkAuth().then(isAuth => {
      if (isAuth) {
        this.router.navigate(['/dashboard']);
      }
    });
    
    // Check for error in query params
    const errorParam = this.route.snapshot.queryParamMap.get('error');
    if (errorParam === 'unauthorized') {
      this.error = 'Access denied. You are not authorized to use this application.';
    }
  }

  login(): void {
    this.authService.login();
  }
}
```

### 16. src/app/pages/callback/callback.component.ts

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      <div class="spinner"></div>
      <p>Authenticating...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--color-light);
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-light);
      border-top-color: var(--color-coral);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    p {
      color: var(--color-gray);
    }
  `],
})
export class CallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit(): Promise<void> {
    // The API callback sets the cookie, we just need to verify and redirect
    const isAuth = await this.authService.checkAuth();
    
    if (isAuth) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login'], { queryParams: { error: 'unauthorized' } });
    }
  }
}
```

### 17. src/app/pages/dashboard/dashboard.component.ts

```typescript
import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ResearchService, DocType } from '../../services/research.service';

interface DocTypeConfig {
  type: DocType;
  label: string;
  icon: string;
  color: string;
  folder?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <header class="header">
        <div class="header-left">
          <div class="logo">
            <span class="logo-e">e</span><span class="logo-i">ï</span>
          </div>
          <h1>Research Dashboard</h1>
        </div>
        <div class="header-right">
          @if (authService.user(); as user) {
            <img [src]="user.avatar_url" [alt]="user.login" class="avatar">
            <span class="username">{{ user.login }}</span>
          }
          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>
      </header>

      <main class="main">
        <!-- Create New Section -->
        <section class="section">
          <h2>Create New</h2>
          <div class="button-grid">
            @for (docType of docTypes; track docType.type) {
              <button 
                class="create-btn" 
                [style.--accent-color]="docType.color"
                (click)="createDoc(docType)"
              >
                <span class="btn-icon">{{ docType.icon }}</span>
                <span class="btn-label">{{ docType.label }}</span>
              </button>
            }
          </div>
        </section>

        <!-- Quick Links Section -->
        <section class="section">
          <h2>Browse Research</h2>
          <div class="link-grid">
            @for (link of quickLinks; track link.path) {
              <a [href]="researchService.getFolderUrl(link.path)" target="_blank" class="folder-link">
                <span class="folder-icon">📁</span>
                <span class="folder-name">{{ link.label }}</span>
                <span class="folder-arrow">→</span>
              </a>
            }
          </div>
        </section>
      </main>

      <!-- Create Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Create {{ selectedType()?.label }}</h3>
            
            <div class="form-group">
              <label for="title">Title</label>
              <input 
                id="title" 
                type="text" 
                [(ngModel)]="formTitle" 
                placeholder="Enter title..."
                (keyup.enter)="submitCreate()"
              >
            </div>

            @if (selectedType()?.type === 'eval') {
              <div class="form-group">
                <label for="agent">Agent Name</label>
                <input id="agent" type="text" [(ngModel)]="formAgent" placeholder="e.g., ClaimExtraction">
              </div>
              <div class="form-group">
                <label for="version">Version</label>
                <input id="version" type="text" [(ngModel)]="formVersion" placeholder="e.g., 1.0">
              </div>
            }

            <div class="modal-actions">
              <button class="btn-secondary" (click)="closeModal()">Cancel</button>
              <button class="btn-primary" (click)="submitCreate()" [disabled]="isCreating()">
                {{ isCreating() ? 'Creating...' : 'Create & Edit' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: var(--color-light);
    }

    .header {
      background: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo {
      font-size: 1.75rem;
      font-weight: 700;
    }

    .logo-e { color: var(--color-coral); }
    .logo-i { color: var(--color-blue); }

    h1 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-dark);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .username {
      font-weight: 500;
      color: var(--color-dark);
    }

    .logout-btn {
      background: none;
      border: 1px solid var(--color-gray);
      color: var(--color-gray);
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      border-color: var(--color-coral);
      color: var(--color-coral);
    }

    .main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .section {
      margin-bottom: 3rem;
    }

    .section h2 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-dark);
      margin-bottom: 1rem;
    }

    .button-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .create-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem;
      background: white;
      border: 2px solid transparent;
      border-radius: 0.75rem;
      transition: all 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .create-btn:hover {
      border-color: var(--accent-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .btn-icon {
      font-size: 2rem;
    }

    .btn-label {
      font-weight: 500;
      color: var(--color-dark);
    }

    .link-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .folder-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: white;
      border-radius: 0.5rem;
      transition: all 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .folder-link:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .folder-icon {
      font-size: 1.5rem;
    }

    .folder-name {
      flex: 1;
      font-weight: 500;
      color: var(--color-dark);
    }

    .folder-arrow {
      color: var(--color-gray);
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .modal {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }

    .modal h3 {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      color: var(--color-dark);
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-dark);
      margin-bottom: 0.5rem;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--color-coral);
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .btn-secondary {
      flex: 1;
      padding: 0.75rem;
      background: var(--color-light);
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      color: var(--color-dark);
      transition: background 0.2s;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .btn-primary {
      flex: 1;
      padding: 0.75rem;
      background: var(--color-coral);
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      color: white;
      transition: background 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #e55555;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `],
  imports: [
    // FormsModule for ngModel
  ],
})
export class DashboardComponent {
  authService = inject(AuthService);
  researchService = inject(ResearchService);

  docTypes: DocTypeConfig[] = [
    { type: 'domain', label: 'Domain Research', icon: '🔬', color: '#FF6B6B' },
    { type: 'industry', label: 'Industry', icon: '🏭', color: '#4ECDC4' },
    { type: 'spec', label: 'Agent Spec', icon: '📋', color: '#95A844' },
    { type: 'eval', label: 'Evaluation', icon: '✅', color: '#9333ea' },
    { type: 'pilot', label: 'Pilot Notes', icon: '🧪', color: '#f59e0b' },
    { type: 'finding', label: 'Finding', icon: '💡', color: '#3b82f6' },
  ];

  quickLinks = [
    { label: 'Claim Categories', path: 'domains/claim-categories' },
    { label: 'Industry Research', path: 'domains/claim-categories/industry-specific' },
    { label: 'Brief Types', path: 'domains/brief-types' },
    { label: 'Agency Workflow', path: 'domains/agency-workflow' },
    { label: 'Sources', path: 'domains/sources' },
    { label: 'Agent Specifications', path: 'agents/specifications' },
    { label: 'Agent Evaluations', path: 'agents/evaluations' },
    { label: 'Pilots', path: 'pilots' },
  ];

  showModal = signal(false);
  selectedType = signal<DocTypeConfig | null>(null);
  isCreating = signal(false);

  formTitle = '';
  formAgent = '';
  formVersion = '1.0';

  createDoc(docType: DocTypeConfig): void {
    this.selectedType.set(docType);
    this.formTitle = '';
    this.formAgent = '';
    this.formVersion = '1.0';
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedType.set(null);
  }

  async submitCreate(): Promise<void> {
    const type = this.selectedType();
    if (!type || !this.formTitle.trim()) return;

    this.isCreating.set(true);

    try {
      const response = await this.researchService.createDocument({
        type: type.type,
        title: this.formTitle.trim(),
        agent: this.formAgent.trim() || undefined,
        version: this.formVersion.trim() || undefined,
      });

      // Open GitHub editor
      window.open(response.editUrl, '_blank');
      this.closeModal();
    } catch (error) {
      console.error('Failed to create document:', error);
      alert('Failed to create document. Please try again.');
    } finally {
      this.isCreating.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
```

### 18. src/app/pages/dashboard/dashboard.component.ts (add FormsModule import)

Update the imports array in the component:

```typescript
import { FormsModule } from '@angular/forms';

@Component({
  // ... same as above
  imports: [FormsModule],
})
```

### 19. api/auth/login.ts

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl = process.env.APP_URL || 'https://research.engagedinquiry.com';
  const redirectUri = `${appUrl}/api/auth/callback`;

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId!);
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.set('scope', 'read:user');

  res.redirect(302, githubAuthUrl.toString());
}
```

### 20. api/auth/callback.ts

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_USERS = ['parth-einquiry'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;
  const appUrl = process.env.APP_URL || 'https://research.engagedinquiry.com';

  if (!code || typeof code !== 'string') {
    return res.redirect(302, `${appUrl}/login?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error('Token error:', tokenData);
      return res.redirect(302, `${appUrl}/login?error=token_failed`);
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    });

    const user = await userResponse.json();

    // Check whitelist
    if (!ALLOWED_USERS.includes(user.login)) {
      console.log(`Unauthorized user attempted login: ${user.login}`);
      return res.redirect(302, `${appUrl}/login?error=unauthorized`);
    }

    // Set secure cookie with token
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      `gh_token=${tokenData.access_token}`,
      'Path=/',
      'HttpOnly',
      `SameSite=${isProduction ? 'Strict' : 'Lax'}`,
      `Max-Age=${60 * 60 * 24 * 7}`, // 7 days
    ];
    
    if (isProduction) {
      cookieOptions.push('Secure');
    }

    res.setHeader('Set-Cookie', cookieOptions.join('; '));
    res.redirect(302, `${appUrl}/dashboard`);
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect(302, `${appUrl}/login?error=callback_failed`);
  }
}
```

### 21. api/auth/me.ts

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parse } from 'cookie';

const ALLOWED_USERS = ['parth-einquiry'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.gh_token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await userResponse.json();

    // Double-check whitelist
    if (!ALLOWED_USERS.includes(user.login)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      login: user.login,
      avatar_url: user.avatar_url,
      name: user.name,
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
```

### 22. api/auth/logout.ts

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Clear the cookie
  res.setHeader('Set-Cookie', 'gh_token=; Path=/; HttpOnly; Max-Age=0');
  res.json({ success: true });
}
```

### 23. api/create.ts

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parse } from 'cookie';
import { Octokit } from '@octokit/rest';

const ALLOWED_USERS = ['parth-einquiry'];
const REPO_OWNER = 'parth-einquiry';
const REPO_NAME = 'inquiry-research';

// Templates
const TEMPLATES: Record<string, (data: any) => string> = {
  domain: (data) => `# Research: ${data.title}

## Status
- **Last Updated**: ${data.date}
- **Status**: Draft

## Objective
[What are we trying to learn?]

## Questions to Answer
- [ ] Question 1
- [ ] Question 2
- [ ] Question 3

## Sources to Consult
- [ ] Source 1
- [ ] Source 2

## Key Findings

### Finding 1
[Description]

## Implications for Inquiry
- [ ] Agent affected: [name]
- [ ] Workflow affected: [name]

## Action Items
- [ ] Action 1
- [ ] Action 2
`,

  industry: (data) => `# ${data.title} Industry — Claim Requirements

## Status
- **Last Updated**: ${data.date}
- **Version**: 0.1
- **Status**: Draft

## Regulatory Bodies
| Body | Jurisdiction | Focus |
|------|--------------|-------|
| | | |

## Claim Categories

### Category 1
**Definition**: [To be defined]
**Risk Level**: [To be determined]
**Substantiation Required**: [To be determined]

## High-Risk Keywords
\`\`\`
[To be populated]
\`\`\`

## Common Violations
1. [To be identified]

## Research Tasks
- [ ] Identify regulatory bodies
- [ ] Document claim categories
- [ ] Collect enforcement examples
`,

  spec: (data) => `# Agent Specification: ${data.title}

## Metadata
- **Version**: 0.1.0
- **Status**: Draft
- **Date**: ${data.date}

## Overview

### Purpose
[What this agent does and why]

### Agent Type
[Extraction / Classification / Verification / Synthesis / Workflow]

## Schemas

### Input Schema
\`\`\`typescript
interface ${data.title.replace(/\s+/g, '')}Input {
  // Define input fields
}
\`\`\`

### Output Schema
\`\`\`typescript
interface ${data.title.replace(/\s+/g, '')}Output {
  // Define output fields
}
\`\`\`

## Business Rules

### Rule 1: [Name]
- **Description**: 
- **Condition**: 
- **Action**: 

## LLM Integration

### Prompt Strategy
[How prompts are constructed]

## Test Cases

### TC-001: [Basic case]
- **Input**: 
- **Expected Output**: 
- **Status**: Pending

## Open Questions
- [ ] Question 1
`,

  eval: (data) => `# Agent Evaluation: ${data.agent || data.title} v${data.version || '1.0'}

## Metadata
- **Agent**: ${data.agent || data.title}
- **Version**: ${data.version || '1.0'}
- **Evaluation Date**: ${data.date}
- **Status**: In Progress

## Test Case Results

| ID | Description | Status |
|----|-------------|--------|
| TC-001 | | ⏳ |
| TC-002 | | ⏳ |

## Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Accuracy | | >90% | |
| Precision | | >85% | |
| Recall | | >85% | |

## Issues Found

### Issue 1: [Title]
- **Severity**: [Critical / High / Medium / Low]
- **Description**: 

## Recommendations
1. Recommendation 1

## Conclusion
[Pass / Fail / Conditional Pass]
`,

  pilot: (data) => `# Pilot: ${data.title}

## Overview
- **Agency**: ${data.title}
- **Start Date**: ${data.date}
- **Status**: Onboarding
- **Primary Contact**: 

## Onboarding Checklist
- [ ] Initial interview completed
- [ ] Workflow documented
- [ ] Sample briefs collected
- [ ] Success criteria agreed

## Feedback Sessions

| Date | Summary | Action Items |
|------|---------|--------------|
| | | |

## Notes
[General notes]
`,

  finding: (data) => `# Finding: ${data.title}

## Metadata
- **Date**: ${data.date}
- **Source**: [Interview / Document / Observation]
- **Confidence**: [High / Medium / Low]

## Summary
[2-3 sentence summary]

## Details
[Full description]

## Evidence
[Data, quotes, observations]

## Implications

### For Product
- Implication 1

### For Agents
- Agent affected: [name]

## Action Items
- [ ] Action 1
`,
};

// Path generators
const PATHS: Record<string, (data: any) => string> = {
  domain: (data) => `domains/claim-categories/${slugify(data.title)}.md`,
  industry: (data) => `domains/claim-categories/industry-specific/${slugify(data.title)}.md`,
  spec: (data) => `agents/specifications/${slugify(data.title)}-spec.md`,
  eval: (data) => `agents/evaluations/${data.date}-${slugify(data.agent || data.title)}-v${(data.version || '1.0').replace(/\./g, '-')}.md`,
  pilot: (data) => `pilots/${slugify(data.title)}/README.md`,
  finding: (data) => `findings/${data.date}-${slugify(data.title)}.md`,
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function verifyUser(token: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const user = await response.json();
    return ALLOWED_USERS.includes(user.login) ? user.login : null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authentication
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.gh_token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const username = await verifyUser(token);
  if (!username) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { type, title, agent, version } = req.body;

  if (!type || !title) {
    return res.status(400).json({ error: 'Missing type or title' });
  }

  if (!TEMPLATES[type] || !PATHS[type]) {
    return res.status(400).json({ error: 'Invalid document type' });
  }

  const date = new Date().toISOString().split('T')[0];
  const data = { title, date, agent, version };

  const content = TEMPLATES[type](data);
  const path = PATHS[type](data);

  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });

    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      message: `docs: add ${title}`,
      content: Buffer.from(content).toString('base64'),
      committer: {
        name: username,
        email: `${username}@users.noreply.github.com`,
      },
    });

    const editUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/edit/main/${path}`;

    res.json({ success: true, path, editUrl });
  } catch (error: any) {
    console.error('Create error:', error);
    res.status(500).json({ error: error.message || 'Failed to create file' });
  }
}
```

### 24. Add cookie package for API

Create `api/package.json`:

```json
{
  "dependencies": {
    "@octokit/rest": "^20.0.0",
    "cookie": "^0.6.0"
  }
}
```

### 25. src/assets/.gitkeep

```
```

### 26. .gitignore

```
# Dependencies
node_modules/
.npm

# Build
dist/
.angular/

# IDE
.idea/
.vscode/
*.swp
*.swo

# Environment
.env
.env.local
.env.*.local

# Vercel
.vercel

# OS
.DS_Store
Thumbs.db

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

---

## Environment Variables for Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
GITHUB_PAT=your_personal_access_token_with_repo_scope
APP_URL=https://research.engagedinquiry.com
NODE_ENV=production
```

---

## Setup Steps After Creating Files

1. Create GitHub OAuth App:
   - GitHub → Settings → Developer Settings → OAuth Apps → New
   - Homepage URL: `https://research.engagedinquiry.com`
   - Callback URL: `https://research.engagedinquiry.com/api/auth/callback`

2. Create GitHub Personal Access Token:
   - GitHub → Settings → Developer Settings → Personal Access Tokens
   - Scope: `repo` (to create files)

3. Install dependencies:
   ```bash
   npm install
   ```

4. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

---

## Folder Structure

```
inquiry-research/
├── api/
│   ├── auth/
│   │   ├── login.ts
│   │   ├── callback.ts
│   │   ├── me.ts
│   │   └── logout.ts
│   ├── create.ts
│   └── package.json
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── pages/
│   │   │   ├── callback/
│   │   │   │   └── callback.component.ts
│   │   │   ├── dashboard/
│   │   │   │   └── dashboard.component.ts
│   │   │   └── login/
│   │   │       └── login.component.ts
│   │   └── services/
│   │       ├── auth.service.ts
│   │       └── research.service.ts
│   ├── assets/
│   │   └── .gitkeep
│   ├── environments/
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── vercel.json
└── .gitignore
```

## Success Criteria
- [ ] All files created
- [ ] `npm install` succeeds
- [ ] `npm start` runs locally
- [ ] GitHub OAuth works
- [ ] Only parth-einquiry can log in
- [ ] Create buttons generate files in repo
- [ ] Files open in GitHub editor after creation
