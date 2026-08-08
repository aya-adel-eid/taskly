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
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthServicesService } from '../../../features/auth/services/auth-services.service';
import { UserInfo } from '../../../features/auth/interfaces/UserInfo';
import { shareReplay, Subject, takeUntil } from 'rxjs';
import { ProjectsService } from '../../../features/projects/services/projects.service';
import { StORED_KEYS } from '../../constants/STORED_KEYS';
import { SharedServiceService } from '../../../shared/shared-service.service';

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

  private readonly projectServices = inject(ProjectsService);
  sharedService = inject(SharedServiceService);
  private destroy$ = new Subject<void>();
  isMobileMenuOpen = false;
  isCollapsed = this.asidBar.isCollapsed;
  isMenuOpen = signal(false);

  private elementRef = inject(ElementRef);
  private isDesktopView = typeof window !== 'undefined' && window.innerWidth >= 1024;
  user = signal<UserInfo | null>(null);

  projectId = computed(() => this.projectServices.selectedProjectId());

  selectedItem = signal('Projects');

  unSelecteProject() {
    this.sharedService.unSelecteProject();
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
      .pipe(takeUntil(this.destroy$), shareReplay())
      .subscribe({
        next: (resp: UserInfo) => {
          this.user.set(resp);
        },
        error: (error: HttpErrorResponse) => {},
      });
  }

  logOut() {
    this.authService.logOut();
    this.isMenuOpen.set(false);
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
