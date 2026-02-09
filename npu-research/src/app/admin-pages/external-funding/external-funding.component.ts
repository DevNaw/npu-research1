import { Component, HostListener } from '@angular/core';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

type FundingStatus = 'พร้อมใช้งาน' | 'ไม่พร้อมใช้งาน';

interface ExternalFunding {
  id: number;
  title: string;
  explanation: string;
  status: FundingStatus;
}

@Component({
  selector: 'app-external-funding',
  standalone: false,
  templateUrl: './external-funding.component.html',
  styleUrl: './external-funding.component.css',
})
export class ExternalFundingComponent {
  pageSize = 10;
  currentPage = 1;
  searchText: string = '';
  today = new Date();

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editIndex: number | null = null;
  isStatusOpen = false;

  externals: ExternalFunding[] = [
    {
      id: 1,
      title: 'สำนักงานการวิจัยแห่งชาติ (วช.)',
      explanation:
        'สนับสนุนทุนวิจัยพื้นฐานและเชิงประยุกต์ทุกสาขา เน้นงานวิจัยที่สร้างองค์ความรู้และประโยชน์ต่อประเทศ',
      status: 'พร้อมใช้งาน',
    },
    {
      id: 2,
      title: 'สำนักงานพัฒนาการวิจัยการเกษตร (สวก.)',
      explanation:
        'ทุนวิจัยด้านการเกษตร อาหาร และเทคโนโลยีชีวภาพ เพื่อเพิ่มขีดความสามารถการแข่งขันของประเทศ',
      status: 'พร้อมใช้งาน',
    },
    {
      id: 3,
      title: 'สำนักงานนวัตกรรมแห่งชาติ (NIA)',
      explanation:
        'สนับสนุนโครงการวิจัยและนวัตกรรมที่สามารถนำไปต่อยอดเชิงพาณิชย์และสร้าง Startup',
      status: 'พร้อมใช้งาน',
    },
    {
      id: 4,
      title: 'สำนักงานคณะกรรมการวิจัยแห่งชาติ (สกสว.)',
      explanation:
        'สนับสนุนการบริหารจัดการงานวิจัยและพัฒนานโยบายวิทยาศาสตร์ วิจัย และนวัตกรรมของประเทศ',
      status: 'ไม่พร้อมใช้งาน',
    },
    {
      id: 5,
      title: 'สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ (สวทช.)',
      explanation:
        'ทุนวิจัยด้านวิทยาศาสตร์ เทคโนโลยี และนวัตกรรมขั้นสูง เพื่อภาคอุตสาหกรรมและสังคม',
      status: 'พร้อมใช้งาน',
    },
  ];

  filteredExternalFunding = [...this.externals];

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredExternalFunding = this.externals.filter((p) =>
      p.title.toLowerCase().includes(keyword)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.externals.length / this.pageSize);
  }

  get paginatedExternalFunding() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.externals.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  exportExcel() {
    const data = this.filteredExternalFunding.map((e, index) => ({
      ลำดับ: index + 1,
      หน่วยงาน: e.title,
      สายวิชาการ: e.explanation,
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

  newFunding: ExternalFunding = {
    id: 0,
    title: '',
    explanation: '',
    status: 'พร้อมใช้งาน',
  };

  openAddModal() {
    this.modalMode = 'add';
    this.newFunding = {
      id: 0,
      title: '',
      explanation: '',
      status: 'พร้อมใช้งาน',
    };
    this.showModal = true;
  }

  openEditModal(item: any, index: number) {
    this.modalMode = 'edit';
    this.editIndex = index;
    this.newFunding = { ...item };
    this.showModal = true;
  }

  updateFunding() {
    if (this.editIndex === null) return;

    this.externals[this.editIndex] = { ...this.newFunding };
    this.onSearch();
    this.closeModal();

    Swal.fire({
      icon: 'success',
      title: 'อัปเดตสำเร็จ',
      text: 'แก้ไขข้อมูลแหล่งทุนเรียบร้อยแล้ว',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
      customClass: {
        title: 'swal-title-lg',
        htmlContainer: 'swal-text-2xl',
      },
    });
  }

  closeModal() {
    this.showModal = false;
    this.isStatusOpen = false;
    this.resetForm();
  }

  saveFunding() {
    if (!this.newFunding.title || !this.newFunding.explanation) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        confirmButtonText: 'ตกลง',
        customClass: {
          title: 'swal-title-lg',
          htmlContainer: 'swal-text-2xl',
          confirmButton: 'swal-btn-3xl',
        },
      });
      return;
    }

    this.externals.push({ ...this.newFunding });
    this.onSearch(); // refresh ตาราง
    this.closeModal();

    Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ',
      text: 'เพิ่มข้อมูลแหล่งทุนเรียบร้อยแล้ว',
      showConfirmButton: false,
      timer: 1000,
      customClass: {
        title: 'swal-title-lg',
        htmlContainer: 'swal-text-2xl',
      },
    });
  }

  resetForm() {
    this.newFunding = {
      id: 0,
      title: '',
      explanation: '',
      status: 'พร้อมใช้งาน',
    };
  }

  /** ✅ ลบแบบปลอดภัย */
  delectFunding(item: ExternalFunding) {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'ข้อมูลนี้จะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        title: 'swal-title-lg',
        htmlContainer: 'swal-text-2xl',
        confirmButton: 'swal-btn-3xl',
        cancelButton: 'swal-btn-3xl',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.externals = this.externals.filter((e) => e.id !== item.id);

        this.onSearch();

        Swal.fire({
          icon: 'success',
          title: 'ลบเรียบร้อย',
          text: 'ข้อมูลถูกลบแล้ว',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            title: 'swal-title-lg',
            htmlContainer: 'swal-text-2xl',
          },
        });
      }
    });
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.isStatusOpen) {
      this.isStatusOpen = false;
    }
  }

  selectStatus(value: FundingStatus) {
    this.newFunding.status = value;
    this.isStatusOpen = false;
  }
}
