import { Component, inject, OnInit, signal } from '@angular/core';
import { BoardColumnComponent } from '../../components/board-column/board-column.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-board-view',
  standalone: true,
  imports: [BoardColumnComponent],
  templateUrl: './board-view.component.html',
  styleUrl: './board-view.component.css',
})
export class BoardViewComponent implements OnInit {
  projectId = signal<string>('');
  private route = inject(ActivatedRoute);
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.projectId.set(params.get('projectId')!);
    });
  }
  statues = [
    {
      value: 'TO_DO',
      title: 'To Do',
      dotClass: 'bg-[#94A3B8]',
      badgeClass: 'bg-[#E0E8FF] text-[#041B3C]',
    },
    {
      value: 'IN_PROGRESS',
      title: 'IN PROGRESS',
      dotClass: 'bg-[#0052CC]',
      badgeClass: 'bg-[#E0E8FF] text-[#041B3C]',
    },
    {
      value: 'BLOCKED',
      title: 'BLOCKED',
      dotClass: 'bg-[#BA1A1A]',
      badgeClass: 'bg-[#FFDAD6] text-[#93000A]',
    },
    {
      value: 'IN_REVIEW',
      title: 'IN REVIEW',
      dotClass: 'bg-[#4F5F7B]',
      badgeClass: 'bg-[#E0E8FF] text-[#041B3C]',
    },
    {
      value: 'READY_FOR_QA',
      title: 'READY FOR QA',
      dotClass: 'bg-[#12B3A8]',
      badgeClass: 'bg-[#E0E8FF] text-[#041B3C]',
    },
    {
      value: 'REOPENED',
      title: 'REOPENED',
      dotClass: 'bg-[#FF8A5C]',
      badgeClass: 'bg-[#E0E8FF] text-[#041B3C]',
    },
    {
      value: 'READY_FOR_PRODUCTION',
      title: 'READY FOR PRODUCTION',
      dotClass: 'bg-[#5C7CFC]',
      badgeClass: 'bg-[#E0E8FF] text-[#041B3C]',
    },
    {
      value: 'DONE',
      title: 'DONE',
      dotClass: 'bg-[#1A9D5C]',
      badgeClass: 'bg-[#E0E8FF] text-[#041B3C]',
    },
  ];
}
