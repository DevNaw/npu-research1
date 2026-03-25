import { Component } from '@angular/core';
import { MainComponent } from '../../shared/layouts/main/main.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { Organization } from '../../models/org.model';
import { OrgService } from '../../services/org.service';

@Component({
  selector: 'app-organization',
  standalone: false,
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.css',
})
export class OrganizationComponent {
  pageSize = 10;
  currentPage = 1;
  searchText = '';
  today = new Date();

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  isStatusOpen = false;

  organizationList: Organization[] = [];
  filteredOrganizations: Organization[] = [];
  selectedOrganization: Organization | null = null;

  constructor(private service: OrgService) {}

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadOrganization(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadOrganization() {
    this.service.getOrganizations().subscribe({
      next: (res) => {
        this.organizationList = res.data.organizations || [];
        this.filteredOrganizations = [...this.organizationList];
      },
      error: () => {
        Swal.fire('โหลดข้อมูลไม่สำเร็จ', '', 'error');
      },
    });
  }

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredOrganizations = this.organizationList.filter(
      (org) =>
        org.faculty.toLowerCase().includes(keyword) ||
        org.faculty_en.toLowerCase().includes(keyword) ||
        org.faculty_short.toLowerCase().includes(keyword) ||
        org.faculty_code.toLowerCase().includes(keyword)
    );

    this.currentPage = 1;
  }

  get paginatedOrganizations() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrganizations.slice(start, start + this.pageSize);
  }

  get totalItems(): number {
    return this.filteredOrganizations.length;
  }
  get totalPages(): number {
    return Math.ceil(this.filteredOrganizations.length / this.pageSize) || 1;
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

    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    ) {
      pages.push(i);
    }

    if (current < total - 2) pages.push('...');

    pages.push(total);

    return pages;
  }
  
  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.currentPage = page;
  }

  openAddModal() {
    this.modalMode = 'add';
    this.selectedOrganization = {
      organization_id: 0,
      faculty_code: '',
      faculty: '',
      faculty_en: '',
      faculty_short: '',
    };
    this.showModal = true;
  }

  openEditModal(item: Organization) {
    this.modalMode = 'edit';
    this.selectedOrganization = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isStatusOpen = false;
    this.selectedOrganization = null;
    this.resetForm();
  }

  saveOrganization() {
    if (!this.selectedOrganization) return;

    Swal.fire({
      title: '_EDGEGING...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.service.createOrganization(this.buildOrganizationData()).subscribe({
      next: () => {
        this.loadOrganization();
        this.resetForm();
        this.closeModal();
        Swal.fire({
          icon: 'success',
          title: 'บันทักสำเร็จ',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
      },
      error: () => Swal.fire('บันทักไม่สำเร็จ', '', 'error'),
    });
  }

  updateOrganization() {
    if (!this.selectedOrganization) return;

    Swal.fire({
      title: '_EDGEGING...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.service
      .updateOrganization(
        this.selectedOrganization.organization_id,
        this.buildOrganizationData()
      )
      .subscribe({
        next: () => {
          this.loadOrganization();
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
            title: 'แก้ไขไม่สำเร็จ',
          }),
      });
  }

  delectOrganization(id: number) {
    Swal.fire({
      title: 'ต้องการลบข้อมูลใช่ไหม?',
      text: 'ข้อมูลจะไม่สามารถกู้้ต้องได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '_EDGEGING...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        this.service.deleteOrganization(id).subscribe({
          next: () => {
            this.loadOrganization();
            Swal.fire({
              icon: 'success',
              title: 'ลบข้อมูลสำเร็จ',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          error: (err) => console.error(err),
        });
      }
    });
  }

  printPage() {
    if (!this.filteredOrganizations || this.filteredOrganizations.length === 0) {
      Swal.fire('ไม่มีข้อมูลให้พิมพ์', '', 'warning');
      return;
    }
  
    const rows = this.filteredOrganizations.map((org, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${org.faculty_code || '-'}</td>
        <td>${org.faculty || '-'}</td>
        <td>${org.faculty_en || '-'}</td>
        <td>${org.faculty_short || '-'}</td>
      </tr>
    `).join('');
  
    const printWindow = window.open('', '', 'width=1000,height=700');
  
    printWindow?.document.write(`
      <html>
        <head>
          <title>รายการหน่วยงาน</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background: #394250; color: white; }
            tr:nth-child(even) { background: #f9f9f9; }
          </style>
        </head>
        <body>
          <h2>รายการหน่วยงาน</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>รหัสหน่วยงาน</th>
                <th>ชื่อหน่วยงาน</th>
                <th>ชื่อหน่วยงานภาษาอังกฤษ</th>
                <th>ชื่อย่อ</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
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
    if (
      !this.filteredOrganizations ||
      this.filteredOrganizations.length === 0
    ) {
      Swal.fire('ไม่มีข้อมูลให้ Export', '', 'warning');
      return;
    }

    const data = this.filteredOrganizations.map((e, index) => ({
      ลำดับ: index + 1,
      รหัสหน่วยงาน: e.faculty_code || '-',
      ชื่อหน่วยงาน: e.faculty || '-',
      ชื่อหน่วยงานภาษาอังกฤษ: e.faculty_en || '-',
      ชื่อย่อ: e.faculty_short || '-',
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // ⭐ คำนวณความกว้าง column อัตโนมัติ
    const colWidths = Object.keys(data[0]).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...data.map((row) =>
            (row as any)[key] ? (row as any)[key].toString().length : 0
          )
        ) + 5,
    }));

    worksheet['!cols'] = colWidths;

    const workbook: XLSX.WorkBook = {
      Sheets: { organization: worksheet },
      SheetNames: ['organization'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    saveAs(blob, 'organization.xlsx');
  }

  resetForm() {
    this.selectedOrganization = {
      organization_id: 0,
      faculty_code: '',
      faculty: '',
      faculty_en: '',
      faculty_short: '',
    };
  }

  private buildOrganizationData(): Partial<Organization> {
    const d = this.selectedOrganization!;

    return {
      ...(d.faculty_code && { faculty_code: d.faculty_code }),
      ...(d.faculty && { faculty: d.faculty }),
      ...(d.faculty_en && { faculty_en: d.faculty_en }),
      ...(d.faculty_short && { faculty_short: d.faculty_short }),
    };
  }
}
