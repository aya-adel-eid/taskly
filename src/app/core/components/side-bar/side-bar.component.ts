import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { AsidBarService } from '../../services/helper/asid-bar.service';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { HttpErrorResponse } from '@angular/common/http';
import { AuthServicesService } from '../../../features/auth/services/auth-services.service';
import { UserInfo } from '../../../features/auth/interfaces/UserInfo';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent implements OnInit ,OnDestroy {
  private readonly asidBar = inject(AsidBarService)
  private readonly authService = inject(AuthServicesService)
private destroy$ = new Subject<void>();
  isMobileMenuOpen = false;
  isCollapsed = this.asidBar.isCollapsed;

  private isDesktopView = typeof window !== 'undefined' && window.innerWidth >= 1024;

  userName!: string;
  userInitials!: string;
  userDepartment!: string;

  asidBarItems = [
    {
      icon: this.asidBar.isCollapsed ? `fa-regular fa-folder-open` : `fa-solid fa-cubes`,
      label: `Projects`,
      route: `/project`,
      disabled: false,
      isActive:true
    },
    { icon: `fa-solid fa-code-branch`, label: `Project Epics` },
    { icon: `fa-solid fa-list-check`, label: `Project Tasks` },
    { icon: `fa-solid fa-user-group`, label: `Project Members` },
    { icon: `fa-solid fa-circle-info`, label: `Project Details` },
  ]

  ngOnInit(): void {
    this.getUserInfo()
  }

 
  @HostListener('window:resize')
  onResize() {
    const wasDesktop = this.isDesktopView;
    this.isDesktopView = window.innerWidth >= 1024;

 
    if (!wasDesktop && this.isDesktopView) {
      this.isMobileMenuOpen = false;
    }
  }

  isDesktop(): boolean {
    return this.isDesktopView;
  }

  toggleCollapse() {
    if (this.isDesktop()) {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  toggleMobileMenu() {
    if (!this.isDesktop()) {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }
  }

  getUserInfo() {
    this.authService.getUserInfo().pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp:UserInfo) => {
        this.userName = resp.user_metadata.name;
        this.userDepartment = resp.user_metadata.job_title;
        const words = resp.user_metadata.name.split(/\s+/);
        if (words.length >= 2) {
          this.userInitials = words[0][0] + words[1][0];
        } else {
          this.userInitials = resp.user_metadata.name.substring(0, 2).toUpperCase();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('getUserInfo failed:', error.status, error.error);
      },
    });
  }

  logOut() {
    this.authService.logOut();
   }
   ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
}

