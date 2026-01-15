import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

export interface Majors {
  name: string; // ชื่อหน่วยงาน
  description: string; // สาขาที่เชี่ยวชาญ
  status: 'พร้อมใช้งาน' | 'ไม่พร้อมใช้งาน';
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
  searchText: string = '';
  today = new Date();

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editIndex: number | null = null;

  majors: Majors[] = [
    {
      name: 'เทคโนโลยีดิจิทัล ปัญญาประดิษฐ์ และข้อมูล',
      description:
        'การพัฒนาระบบดิจิทัล ปัญญาประดิษฐ์ และการวิเคราะห์ข้อมูล เพื่อสนับสนุนเศรษฐกิจและสังคมดิจิทัล',
      status: 'พร้อมใช้งาน',
    },
    {
      name: 'เกษตรศาสตร์ อาหาร และเทคโนโลยีชีวภาพ',
      description:
        'การวิจัยด้านการเกษตรและอาหาร เพื่อเพิ่มมูลค่าและความมั่นคงทางอาหาร',
      status: 'ไม่พร้อมใช้งาน',
    },
  ];

  filteredExternalFunding = [...this.majors];

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredExternalFunding = this.majors.filter((p) =>
      p.name.toLowerCase().includes(keyword)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.majors.length / this.pageSize);
  }

  get paginatedExternalFunding() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.majors.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  exportExcel() {
    const data = this.filteredExternalFunding.map((m, index) => ({
      ลำดับ: index + 1,
      หน่วยงาน: m.name,
      สายวิชาการ: m.description,
    }));

    // เพิ่มแถวรวมท้ายตาราง
    data.push({
      ลำดับ: 1,
      หน่วยงาน: 'รวมทั้งหมด',
      สายวิชาการ: '',
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { รายงานนักวิจัย: worksheet },
      SheetNames: ['รายงานนักวิจัย'],
    };

    XLSX.writeFile(workbook, 'รายงานข้อมูลนักวิจัย.xlsx');
  }

  printPage() {
    window.print();
  }

  newMajors: Majors = {
    name: '',
    description: '',
    status: 'พร้อมใช้งาน',
  };

  openAddModal() {
    this.modalMode = 'add';
    this.newMajors = { name: '', description: '', status: 'พร้อมใช้งาน' };
    this.showModal = true;
  }

  openEditModal(item: any, index: number) {
    this.modalMode = 'edit';
    this.editIndex = index;
    this.newMajors = { ...item };
    this.showModal = true;
  }

  updateFunding() {
    if (this.editIndex === null) return;

    this.majors[this.editIndex] = { ...this.newMajors };
    this.onSearch();
    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  saveFunding() {
    if (!this.newMajors.name || !this.newMajors.description) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    this.majors.push({ ...this.newMajors });
    this.onSearch(); // refresh ตาราง
    this.closeModal();

    Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ',
      text: 'เพิ่มข้อมูลสาขาเรียบร้อยแล้ว',
      timer: 1500,
      showConfirmButton: false,
    });
  }

  resetForm() {
    this.newMajors = {
      name: '',
      description: '',
      status: 'พร้อมใช้งาน',
    };
  }

  deleteFunding(index: number) {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'ข้อมูลนี้จะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        // ลบข้อมูล
        this.majors.splice(index, 1);

        // refresh ตาราง / search
        this.onSearch();

        Swal.fire({
          icon: 'success',
          title: 'ลบเรียบร้อย',
          text: 'ข้อมูลถูกลบแล้ว',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }
}
