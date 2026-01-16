import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface ExternalPerson {
  name: string;
  role: string;
  organization: string;
}
interface InternalPerson {
  name: string;
  organization: string;
}

@Component({
  selector: 'app-user-add-innovation',
  standalone: false,
  templateUrl: './user-add-innovation.component.html',
  styleUrl: './user-add-innovation.component.css'
})
export class UserAddInnovationComponent {
  isEdit = false;
  researchId?: number;
  rows: ExternalPerson[] = [];
  rows2: InternalPerson[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        this.isEdit = true;
        this.researchId = +id;
        this.loadInnovationData(this.researchId);
      } else {
        this.isEdit = false;
      }
    });

    this.addRow(); 
    this.addRow2(); 
  }

  loadInnovationData(id: number) {
    this.rows = [
      { name: 'นาย A', role: 'ผู้เชี่ยวชาญ', organization: 'บริษัท ABC' }
    ];
  
    this.rows2 = [
      { name: 'ดร. B', organization: 'มหาวิทยาลัย X' }
    ];
  
    this.reportFileName = 'report.pdf';
  }

  addRow() {
    this.rows = [
      ...this.rows,
      {
        name: '',
        role: '',
        organization: '',
      },
    ];
  }
  removeRow(index: number) {
    // กันไม่ให้ลบแถวสุดท้าย
    if (this.rows.length > 1) {
      this.rows.splice(index, 1);
    }
  }

  addRow2() {
    this.rows2 = [
      ...this.rows2,
      {
        name: '',
        organization: '',
      },
    ];
  }
  removeRow2(index: number) {
    // กันไม่ให้ลบแถวสุดท้าย
    if (this.rows2.length > 1) {
      this.rows2.splice(index, 1);
    }
  }

  trackByIndex(index: number) {
    return index;
  }

  selectedFile: File | null = null;
  selectedFileName = '';

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }
  reportFile: File | null = null;
  reportFileName = '';

  onReportFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.reportFile = input.files[0];
      this.reportFileName = this.reportFile.name;
    }
  }
}
