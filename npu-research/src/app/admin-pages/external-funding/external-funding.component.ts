import { Component, HostListener } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { Funding } from '../../models/admin-funding.model';
import { AdminFundingService } from '../../services/admin-funding.service';
import { MainComponent } from '../../shared/layouts/main/main.component';

@Component({
  selector: 'app-external-funding',
  standalone: false,
  templateUrl: './external-funding.component.html',
  styleUrl: './external-funding.component.css',
})
export class ExternalFundingComponent {
  pageSize = 10;
  currentPage = 1;
  searchText = '';
  today = new Date();

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  isStatusOpen = false;

  fundings: Funding[] = [];
  filteredFundings: Funding[] = [];
  selectedFunding: Funding | null = null;

  constructor(private service: AdminFundingService) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    Promise.all([
      this.loadFunding(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadFunding() {
    this.service.getFunding().subscribe({
      next: (res) => {
        this.fundings = res.data.fundings || [];
        this.filteredFundings = [...this.fundings];
      },
      error: () => {
        Swal.fire('โหลดข้อมูลไม่สำเร็จ', '', 'error');
      },
    });
  }

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredFundings = this.fundings.filter((p) =>
      p.funding_name.toLowerCase().includes(keyword)
    );

    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredFundings.length / this.pageSize) || 1;
  }

  get paginatedExternalFunding() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredFundings.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  exportExcel() {

    if (!this.filteredFundings || this.filteredFundings.length === 0) {
      Swal.fire('ไม่มีข้อมูลให้ Export', '', 'warning');
      return;
    }
  
    const data = this.filteredFundings.map((e, index) => ({
      'ลำดับ': index + 1,
      'ชื่อแหล่งทุน': e.funding_name || '-',
      'คำอธิบาย': e.description || '-',
      'สถานะใช้งาน': e.is_active === 1 ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'
    }));
  
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  
    // ⭐ คำนวณความกว้าง column อัตโนมัติ
    const colWidths = Object.keys(data[0]).map(key => ({
      wch: Math.max(
        key.length,
        ...data.map(row => ((row as any)[key] ? (row as any)[key].toString().length : 0))
      ) + 5
    }));
  
    worksheet['!cols'] = colWidths;
  
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Funding': worksheet },
      SheetNames: ['Funding']
    };
  
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });
  
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream'
    });
  
    saveAs(blob, 'external_funding.xlsx');
  }

  printPage() {

    const table = document.getElementById('fundingTable');
  
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

  openAddModal() {
    this.modalMode = 'add';
    this.selectedFunding = {
      id: 0,
      funding_name: '',
      funding_code: '',
      description: '',
      is_active: 1,
    };

    this.showModal = true;
  }

  openEditModal(item: Funding) {
    this.modalMode = 'edit';
    this.selectedFunding = { ...item };
    this.showModal = true;
  }

  updateFunding() {
    if (!this.selectedFunding) return;

    this.service
      .updateFunding(this.selectedFunding.id, this.buildFundingData())
      .subscribe({
        next: () => {
          this.loadFunding();
          this.closeModal();
          Swal.fire({
            icon: 'success',
            title: 'แก้ไขสำเร็จ',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
          });
        },
        error: () =>
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
          }),
      });
  }

  closeModal() {
    this.showModal = false;
    this.isStatusOpen = false;
    this.resetForm();
  }

  saveFunding() {
    if (!this.selectedFunding) return;

    this.service.createFunding(this.buildFundingData()).subscribe({
      next: () => {
        this.loadFunding();
        this.resetForm();
        this.closeModal();
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
      },
      error: () => Swal.fire('เกิดข้อผิดพลาด', '', 'error'),
    });
  }

  resetForm() {
    this.selectedFunding = {
      id: 0,
      funding_name: '',
      funding_code: '',
      description: '',
      is_active: 1,
    };
  }

  delectFunding(id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.service.deleteFunding(id).subscribe({
        next: () => {
          this.loadFunding();
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
          });
        },
      });
    });
  }

  selectStatus(value: 0 | 1) {
    if (!this.selectedFunding) return;
    this.selectedFunding.is_active = value;
    this.isStatusOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.isStatusOpen) {
      this.isStatusOpen = false;
    }
  }

  private buildFundingData(): Partial<Funding> {
    const d = this.selectedFunding!;

    return {
      ...(d.funding_name && { funding_name: d.funding_name }),
      ...(d.funding_code && { funding_code: d.funding_code }),
      ...(d.description && { description: d.description }),
      ...(d.is_active !== undefined && { is_active: d.is_active }),
    };
  }

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];
  
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
  
    pages.push(1);
  
    if (current > 3) pages.push('...');
  
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
  
    if (current < total - 2) pages.push('...');
  
    pages.push(total);
  
    return pages;
  }
}
