import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MajorData } from '../../models/major.model';

@Component({
  selector: 'app-performance-detail-by-department',
  standalone: false,
  templateUrl: './performance-detail-by-department.component.html',
  styleUrl: './performance-detail-by-department.component.css'
})
export class PerformanceDetailByDepartmentComponent {
  pageSize = 10;
  currentPage = 1;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
  }

  majors: MajorData[] = [
    {
      id: 1,
      branch_name: 'สาขาวิศวกรรม',
      academic: 2,
    },
    {
      id: 2,
      branch_name: 'สาขาวิศวกรรม',
      academic: 2,
    },
    {
      id: 3,
      branch_name: 'สาขาวิศวกรรม',
      academic: 2,
    },
  ]

  filteredMajors = [...this.majors];

  get totalPages(): number {
    return Math.ceil(this.majors.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => + 1);
  }

  get totalMajors(): number {
    return this.filteredMajors.reduce(
      (sum: number, m: any) => sum + m.academic, 0
    );
  }

  get totalSupport(): number {
    return this.filteredMajors.reduce(
      (sum: number, m: any) => sum + m.support, 0
    );
  }

  get paginatedMajors() {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    return this.majors.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;

    if (page === this.currentPage) return;

    this.currentPage = page;
  }
  
  goToDetail() {
    this.router.navigate(['/']);
  }
}
