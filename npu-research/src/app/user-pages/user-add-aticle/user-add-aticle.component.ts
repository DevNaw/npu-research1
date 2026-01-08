import { Component } from '@angular/core';

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
  selector: 'app-user-add-aticle',
  standalone: false,
  templateUrl: './user-add-aticle.component.html',
  styleUrl: './user-add-aticle.component.css'
})
export class UserAddAticleComponent {
  rows: ExternalPerson[] = [];
  rows2: InternalPerson[] = [];

  ngOnInit() {
    this.addRow(); 
    this.addRow2(); 
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
