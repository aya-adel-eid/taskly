import { Component, inject, signal } from '@angular/core';
import { RusableInputComponent } from '../../../auth/components/rusable-input/rusable-input.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { Member } from '../../interfaces/IMembers';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-new-epics',
  standalone: true,
  imports: [RusableInputComponent, RouterLink],
  templateUrl: './new-epics.component.html',
  styleUrl: './new-epics.component.css',
})
export class NewEpicsComponent {
  private readonly projectServices = inject(ProjectsService);
  private readonly activateRoute = inject(ActivatedRoute);
  allMembers = signal<Member[] | null>(null);
  projectId = signal<string>('');
  private destroy$ = new Subject<void>();
  ngOnInit(): void {
    this.activateRoute.paramMap.subscribe((param) => this.projectId.set(param.get('projectId')!));
    this.getAllMembers();
  }
  addEpics() {}

  getAllMembers() {
    this.projectServices
      .getAllMembers(this.projectId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          console.log(resp);
          this.allMembers.set(resp);
        },
        error: (error: HttpErrorResponse) => {},
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
