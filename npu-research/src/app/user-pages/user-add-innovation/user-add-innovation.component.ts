import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  Responsibility,
  ResponsibilityRole,
  InternalPerson,
  ExternalPerson,
  ResearchData,
} from '../../models/add.research.model';
import { InnovationForm, Major, SubArea } from '../../models/subject.model';
import { ResearchService } from '../../services/research.service';
import { Researcher } from '../../models/researchers.model';

@Component({
  selector: 'app-user-add-innovation',
  standalone: false,
  templateUrl: './user-add-innovation.component.html',
  styleUrl: './user-add-innovation.component.css',
})
export class UserAddInnovationComponent {
  isEdit = false;
  researchId?: number;

  selectedMajor: Major | null = null;
  searchMajor = '';
  searchSub = '';
  majors: Major[] = [];
  selectedSub: SubArea | null = null;

  fundType: string = '';
  fundName: string = '';

  isResponsibility = false;
  isResponsibilityOfInternal = false;
  isResponsibilityOfExternal = false;

  internalPeople: InternalPerson[] = [];
  externalPeople: ExternalPerson[] = [];

  activeDropdown: string | null = null;
  activeMajor: Major | null = null;
  activeRowIndex: number | null = null;

  researchers: Researcher[] = [];
  filteredResearchers: Researcher[] = [];

  responsibilityRoles: ResponsibilityRole[] = [
    'ที่ปรึกษา',
    'ผู้เชี่ยวชาญ',
    'กรรมการ',
  ];

  openInternalIndex: number | null = null;
  openExternalIndex: number | null = null;
  openStatus: number | null = null;

  rows2 = [{ id: Date.now(), name: '', responsibility: '' }];
  rows = [
    {
      name: '',
      organization: '',
      responsibility: '',
    },
  ];

  internalMembers = [
    {
      name: '',
      organization: '',
    },
  ];

  externalMembers = [
    {
      name: '',
      organization: '',
      role: '',
    },
  ];

  internalFunds: string[] = [
    'งบประมาณมหาวิทยาลัย',
    'กองทุนวิจัยมหาวิทยาลัย',
    'คณะ/วิทยาลัย',
  ];

  externalFunds: string[] = [
    'สำนักงานการวิจัยแห่งชาติ (วช.)',
    'สกสว.',
    'กระทรวงการอุดมศึกษา',
    'หน่วยงานเอกชน',
  ];

  innovation: InnovationForm = {
    responsibility: '',
    type: '',
    quality: '',
    status: '',
    funding: '',
    major_id: null,
    sub_id: null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private researchService: ResearchService
  ) {}

  ngOnInit() {
    this.loadSubjectArea();
    this.loadResearcherData();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.isEdit = true;
        this.researchId = +id;
        this.loadInnovationData(this.researchId);
      } else {
        this.isEdit = false;
      }
    });

    this.addInternal();
    this.addExternal();
  }

  loadSubjectArea() {
    this.researchService.getSubjectArea().subscribe({
      next: (res) => {
        this.majors = res.data.subject_areas;
      },
      error: (err) => {
        console.error('Not Found!', err);
      },
    });
  }

  loadResearcherData() {
    this.researchService.getResearchers().subscribe({
      next: (res) => {
        this.researchers = res.data.$researchers;
        this.filteredResearchers = this.researchers;
      },
    });
  }

  addInternal() {
    this.internalMembers.push({
      name: '',
      organization: '',
    });
  }

  addExternal() {
    this.externalMembers.push({
      name: '',
      organization: '',
      role: '',
    });
  }

  removeInternal(index: number) {
    if (this.internalPeople.length > 1) {
      this.internalPeople.splice(index, 1);
    }
  }

  loadInnovationData(id: number) {
    
    // this.rows2 = [{ name: 'ดร. B', organization: 'มหาวิทยาลัย X' }];

    // this.reportFileName = 'report.pdf';
  }

  addRow() {
    this.rows.push({ name: '', organization: '', responsibility: '' });
  }

  addRow2() {
    this.rows2.push({ id: Date.now() + Math.random(), name: '', responsibility: '' });
  }

  removeRow(index: number) {
      this.rows.splice(index, 1);
  }

  removeRow2(index: number) {
      this.rows2.splice(index, 1);
  }

  selectRowResponsibility(row: any, value: string) {
    if (
      value === 'First Author (ผู้ประพันธ์อันดับแรก)' &&
      this.isFirstAuthorTaken(row)
    ) {
      return;
    }

    row.responsibility = value;
    this.activeDropdown = null;
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

  toggleDropdown(name: string, event: MouseEvent) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  @HostListener('document:click')
  closeAll() {
    this.activeDropdown = null;
  }

  selectMajor(m: Major) {
    this.selectedMajor = m;
    this.activeDropdown = null;
    this.searchMajor = '';
  }

  filteredMajor(): Major[] {
    if (!this.searchMajor) return this.majors;

    return this.majors.filter((m) =>
      m.name_en.toLowerCase().includes(this.searchMajor.toLowerCase())
    );
  }

  saveData() {
    Swal.fire({
      icon: 'success',
      title: 'บันทึกข้อมูลสำเร็จ',
      text: 'ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว',
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        title: 'swal-title-lg',
        htmlContainer: 'swal-text-2xl',
      },
    });
  }

  toggleInternal(index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdown = 'internal';
    this.openInternalIndex = this.openInternalIndex === index ? null : index;
  }

  toggleExternal(index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdown = 'external';
    this.openExternalIndex = this.openExternalIndex === index ? null : index;
  }

  toggleType(event: Event) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === 'type' ? null : 'type';
  }

  toggleResponsibility(event: Event) {
    event.stopPropagation();
    this.activeDropdown =
      this.activeDropdown === 'responsibility' ? null : 'responsibility';
  }
  toggleStatus(event: Event) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === 'status' ? null : 'status';
  }

  selectStatus(status: string) {
    this.innovation.status = status;
    this.activeDropdown = null;
  }

  selectInternalRole(role: string, member: any) {
    member.organization = role;
    this.openInternalIndex = null;
  }

  selectExternalRole(role: string, member: any) {
    member.organization = role;
    this.openExternalIndex = null;
  }
  selectResponsibility(value: string) {
    this.innovation.responsibility = value;
    this.activeDropdown = null;
  }

  toggleFunding(event: MouseEvent) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === 'funding' ? null : 'funding';
  }

  toggleNameFunding(event: MouseEvent) {
    event.stopPropagation();
    this.activeDropdown =
      this.activeDropdown === 'fundName' ? null : 'fundName';
  }

  // ===== select funding =====
  selectFunding(type: string) {
    this.innovation.funding = type;
    this.fundName = ''; // reset ชื่อแหล่งทุน
    this.activeDropdown = null;
  }

  // ===== select fund name =====
  selectFundName(name: string) {
    this.fundName = name;
    this.activeDropdown = null;
  }

  selectSub(sub: SubArea) {
    this.selectedSub = sub;
    this.activeDropdown = null;
    this.activeMajor = null;

    this.innovation.major_id = sub.major_id;
    this.innovation.sub_id = sub.sub_id;
  }

  selectResearcher(r: Researcher, j: any) {
    j.name = r.full_name;
    j.user_id = r.user_id;

    this.activeRowIndex = null;
  }

  filteredSub() {
    if (!this.selectedMajor) return [];

    return this.selectedMajor.children.filter((s) =>
      s.name_en.toLowerCase().includes(this.searchSub.toLowerCase())
    );
  }

  toggleMajor(major: Major, event: Event) {
    event.stopPropagation();

    if (this.activeMajor?.major_id === major.major_id) {
      this.activeMajor = null;
    } else {
      this.activeMajor = major;
    }
  }

  onFocus(index: any) {
    this.activeRowIndex = index.id;
    this.filteredResearchers = this.researchers;
  }

  onSearch(value: string) {
    if (!value) {
      this.filteredResearchers = this.researchers;
      return;
    }

    this.filteredResearchers = this.researchers.filter((r) =>
      r.full_name?.toLowerCase().includes(value.toLowerCase())
    );
  }

  isFirstAuthorTaken(currentRow?: any): boolean {
    if (
      this.innovation?.responsibility === 'First Author (ผู้ประพันธ์อันดับแรก)'
    ) {
      return true;
    }

    const allRows = [...this.rows2, ...this.rows];

    return allRows.some(
      (row) =>
        row !== currentRow &&
        row.responsibility === 'First Author (ผู้ประพันธ์อันดับแรก)'
    );
  }
}
