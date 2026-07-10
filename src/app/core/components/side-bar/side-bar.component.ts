import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { AsidBarService } from '../../services/helper/asid-bar.service';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthServicesService } from '../../../features/auth/services/auth-services.service';
import { UserInfo } from '../../../features/auth/interfaces/UserInfo';
import { Subject, takeUntil } from 'rxjs';
import { ProjectsService } from '../../../features/projects/services/projects.service';
import { StORED_KEYS } from '../../constants/STORED_KEYS';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css',
})
export class SideBarComponent implements OnInit, OnDestroy {
  private readonly asidBar = inject(AsidBarService);
  private readonly authService = inject(AuthServicesService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly projectServices = inject(ProjectsService);
  private destroy$ = new Subject<void>();
  isMobileMenuOpen = false;
  isCollapsed = this.asidBar.isCollapsed;

  private isDesktopView = typeof window !== 'undefined' && window.innerWidth >= 1024;

  userName!: string;
  userInitials!: string;
  userDepartment!: string;

  // بقت computed جاي من الـ service مباشرة، مش signal منفصل
  projectId = computed(() => this.projectServices.selectedProjectId());

  route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  selectedItem = signal('Projects');

  unSelecteProject() {
    sessionStorage.removeItem(StORED_KEYS.projectId);
    this.projectServices.selectedProjectId.set('');
  }

  isActive(route: string | null): boolean {
    if (!route) return false;
    return this.router.url.startsWith(route);
  }

  ngOnInit(): void {
    this.getUserInfo();

    const stored = sessionStorage.getItem(StORED_KEYS.projectId);
    if (stored) {
      this.projectServices.selectedProjectId.set(stored);
    }
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
      this.asidBar.toggleCollapse();
    }
  }

  toggleMobileMenu() {
    if (!this.isDesktop()) {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }
  }

  getUserInfo() {
    this.authService
      .getUserInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: UserInfo) => {
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
    this.isMenuOpen.set(false);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  isMenuOpen = signal(false);

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen.update((v) => !v);
  }

  private elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }
}
