import { Component, HostListener } from '@angular/core';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { AdminExpertiseService } from '../../services/admin-expertise.service';
import { Expertise } from '../../models/admin-expertise.model';
import { MainComponent } from '../../shared/layouts/main/main.component';
import saveAs from 'file-saver';

type MajorStatus = 'พร้อมใช้งาน' | 'ไม่พร้อมใช้งาน';

export interface Majors {
  name: string;
  description: string;
  status: MajorStatus;
}

@Component({
  selector: 'app-specialization',
  standalone: false,
  templateUrl: './specialization.component.html',
  styleUrl: './specialization.component.css',
})
export class SpecializationComponent {
  pageSize = 10;
  currentPage = 1;
  searchText = '';
  today = new Date();

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  isStatusOpen = false;

  expertises: Expertise[] = [];
  filteredExpertises: Expertise[] = [];

  selectedExpertise: Expertise | null = null;

  constructor(private service: AdminExpertiseService) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    Promise.all([
      this.loadExpertise(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadExpertise() {
    this.service.getExpertise().subscribe({
      next: (res) => {
        this.expertises = res.data.expertises || [];
        this.filteredExpertises = [...this.expertises];
      },
      error: () => {
        Swal.fire('โหลดข้อมูลไม่สำเร็จ', '', 'error');
      },
    });
  }

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredExpertises = this.expertises.filter(
      (e) =>
        e.name_th.toLowerCase().includes(keyword) ||
        e.name_en.toLowerCase().includes(keyword)
    );

    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredExpertises.length / this.pageSize) || 1;
  }

  get paginatedExpertises(): Expertise[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredExpertises.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  openAddModal() {
    this.modalMode = 'add';
    this.selectedExpertise = {
      expertise_id: 0,
      name_th: '',
      name_en: '',
      is_active: 1,
    };
    this.showModal = true;
  }

  openEditModal(item: Expertise) {
    this.modalMode = 'edit';
    this.selectedExpertise = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isStatusOpen = false;
    this.selectedExpertise = null;
  }

  saveExpertise() {
    if (!this.selectedExpertise) return;

    this.service.createExpertise(this.selectedExpertise).subscribe({
      next: () => {
        this.loadExpertise();
        this.resetForm();
        this.closeModal();
        Swal.fire({
          icon: 'success',
            title: 'บันทึกสำเร็จ',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true
        });
      },
      error: () => Swal.fire('เกิดข้อผิดพลาด', '', 'error'),
    });
  }

  updateExpertise() {
    if (!this.selectedExpertise) return;

    this.service
      .updateExpertise(
        this.selectedExpertise.expertise_id,
        this.selectedExpertise
      )
      .subscribe({
        next: () => {
          this.loadExpertise();
          this.closeModal();
      
          Swal.fire({
            icon: 'success',
            title: 'อัปเดตสำเร็จ',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true
          });
        },
        error: () =>
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด'
          }),
      });
  }

  deleteExpertise(id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.service.deleteExpertise(id).subscribe({
        next: () => {
          this.loadExpertise();
      
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
        },
        error: () =>
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
          }),
      });
    });
  }

  selectStatus(value: 0 | 1) {
    if (!this.selectedExpertise) return;
    this.selectedExpertise.is_active = value;
    this.isStatusOpen = false;
  }

  @HostListener('document:click')
  closeStatusDropdown() {
    this.isStatusOpen = false;
  }

  printPage() {

    const table = document.getElementById('specializationTable');
  
    if (!table) {
      Swal.fire('ไม่พบตาราง', '', 'warning');
      return;
    }
  
    const tableClone = table.cloneNode(true) as HTMLElement;
  
    const rows = tableClone.querySelectorAll('tr');
  
    rows.forEach((row, index) => {
  
      const cells = row.querySelectorAll('th, td');
  
      // ลบ column Action
      if (cells[4]) {
        cells[4].remove();
      }
  
      // แปลง icon สถานะเป็นข้อความ
      if (index > 0 && cells[3]) {
  
        const icon = cells[3].querySelector('i');
  
        if (icon?.classList.contains('bi-check-circle-fill')) {
          cells[3].innerHTML = '✔ พร้อมใช้งาน';
        } else {
          cells[3].innerHTML = '✘ ไม่พร้อมใช้งาน';
        }
  
      }
  
    });
  
    const printWindow = window.open('', '', 'width=900,height=700');
  
    printWindow?.document.write(`
      <html>
        <head>
          <title>รายการแหล่งทุน</title>
          <style>
            body{
              font-family: Arial;
              padding:20px;
            }
  
            h2{
              text-align:center;
              margin-bottom:20px;
            }
  
            table{
              width:100%;
              border-collapse: collapse;
            }
  
            th, td{
              border:1px solid #ccc;
              padding:8px;
              text-align:center;
            }
  
            th{
              background:#394250;
              color:white;
            }
          </style>
        </head>
        <body>
  
          <h2>รายการแหล่งทุน</h2>
  
          ${tableClone.outerHTML}
  
        </body>
      </html>
    `);
  
    printWindow?.document.close();
  
    setTimeout(() => {
      printWindow?.print();
      printWindow?.close();
    }, 500);
  
  }

  exportExcel() {
    if (!this.filteredExpertises || this.filteredExpertises.length === 0) {
      Swal.fire('ไม่มีข้อมูลให้ Export', '', 'warning');
      return;
    }

    const data = this.filteredExpertises.map((e, index) => ({
      'ลำดับ': index + 1,
      'ชื่อสาขาที่เชี่ยวชาญ': e.name_th || '-',
      'ชื่อสาขาที่เชี่ยวชาญภาษาอังกฤษ': e.name_en || '-',
      'สถานะใช้งาน': e.is_active === 1 ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน',
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    const colWidths = Object.keys(data[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...data.map((row) => ((row as any)[key] ? (row as any)[key].toString().length : 0))
      ) + 5,
    }));

    worksheet['!cols'] = colWidths;

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Specialization': worksheet },
      SheetNames: ['Specialization'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    saveAs(blob, 'specialization.xlsx');
  }

  resetForm() {
    this.selectedExpertise = {
      expertise_id: 0,
      name_th: '',
      name_en: '',
      is_active: 1,
    };
  }
}
