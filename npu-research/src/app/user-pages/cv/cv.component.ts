import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { ProfileService } from '../../services/profile.service';
import { UserProfile } from '../../models/profiledetai.model';
import { ResearchItem } from '../../models/profile-project.model';
import { MainComponent } from '../../shared/layouts/main/main.component';

type ResearchProfileType = 'google_scholar' | 'researchgate' | 'scopus' | 'orcid';

interface ResearchProfile {
  type: ResearchProfileType;
  url: string;
}

/** ผลงานที่จัดรูปแบบแล้วสำหรับแสดงใน CV */
interface CvWork {
  year: string; // ปี พ.ศ.
  title: string;
  titleEn?: string;
  code?: string;
}

/** ส่วนที่ผู้ใช้เลือกแสดง/ซ่อนได้ */
interface CvSectionToggle {
  key: 'personal' | 'education' | 'work' | 'expertise' | 'project' | 'article' | 'innovation' | 'links';
  label: string;
  show: boolean;
}

/* ===== ค่าคงที่สำหรับ PDF (A4) ===== */
const A4_W_MM = 210;
const A4_H_MM = 297;
const MARGIN_Y_MM = 12; // ขอบบน/ล่างของแต่ละหน้า
const MARGIN_X_MM = 14; // ใช้วางเลขหน้า (ขอบซ้าย/ขวาอยู่ใน padding ของ .cv-pdf)
const ACCENT_MM = 1.6; // แถบเหลืองซ้าย
const PAGE_W_PX = 794; // 210mm @ 96dpi
const MM_PER_PX = A4_W_MM / PAGE_W_PX;
const USABLE_H_PX = Math.floor((A4_H_MM - MARGIN_Y_MM * 2) / MM_PER_PX); // ≈ 1032px
const MAX_CANVAS_PX = 30000; // กันเกินขีดจำกัด canvas ของเบราว์เซอร์
const BLANK_PX =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

interface PdfPage {
  start: number; // px
  end: number; // px
}

interface PdfLink {
  url: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-cv',
  standalone: false,
  templateUrl: './cv.component.html',
  styleUrl: './cv.component.css',
  // ปิด encapsulation เพื่อให้ class .cv-pdf ใช้กับ clone ที่สร้างนอก component ได้
  // class ทั้งหมดในไฟล์ css ขึ้นต้นด้วย cv- เพื่อไม่ชนกับส่วนอื่น
  encapsulation: ViewEncapsulation.None,
})
export class CvComponent implements OnInit {
  @ViewChild('sheet') sheetRef?: ElementRef<HTMLElement>;

  profile?: UserProfile;
  researchProfiles: ResearchProfile[] = [];

  projects: CvWork[] = [];
  articles: CvWork[] = [];
  innovations: CvWork[] = [];

  loaded = false;
  loadError = false;
  exporting = false;
  showTitleEn = false; // แสดงชื่อผลงานภาษาอังกฤษใต้ชื่อไทย
  readonly printedAt = new Date();

  /**
   * TODO: ชั่วคราว — ใช้รูป mock แทนรูปจาก API (profile.avatar_url)
   * เมื่อ API พร้อม (เปิด CORS ให้รูปแล้ว) ให้เปลี่ยนกลับเป็น:
   *   get avatarSrc() { return this.profile?.avatar_url || '/assets/default_profile.png'; }
   */
  readonly avatarSrc = '/assets/mock.png';

  sections: CvSectionToggle[] = [
    { key: 'personal', label: 'ข้อมูลส่วนตัว', show: true },
    { key: 'education', label: 'ประวัติการศึกษา', show: true },
    { key: 'work', label: 'การทำงาน', show: true },
    { key: 'expertise', label: 'ความเชี่ยวชาญและความสนใจ', show: true },
    { key: 'project', label: 'โครงการวิจัย', show: true },
    { key: 'article', label: 'ผลงานตีพิมพ์', show: true },
    { key: 'innovation', label: 'นวัตกรรมสิ่งประดิษฐ์', show: true },
    { key: 'links', label: 'ลิงก์โปรไฟล์นักวิจัย', show: true },
  ];

  readonly profileTypeLabel: Record<ResearchProfileType, string> = {
    google_scholar: 'Google Scholar',
    researchgate: 'ResearchGate',
    scopus: 'Scopus',
    orcid: 'ORCID',
  };

  constructor(private service: ProfileService, private location: Location) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    this.service.getProfile().subscribe({
      next: (res) => {
        const data = res.data;
        this.profile = data.user;
        this.researchProfiles = data.user?.research_profiles ?? [];

        const researchs: any = data.researchs ?? {};
        this.projects = this.toWorks(researchs.projects);
        this.articles = this.toWorks(researchs.articles);
        this.innovations = this.toWorks(researchs.innovations);

        this.loaded = true;
        MainComponent.hideLoading();
      },
      error: (err) => {
        console.error(err);
        this.loadError = true;
        MainComponent.hideLoading();
      },
    });
  }

  // ── Section helpers ──────────────────────────────────────────
  isShown(key: CvSectionToggle['key']): boolean {
    return this.sections.find((s) => s.key === key)?.show ?? false;
  }

  get hasPersonal(): boolean {
    const g = this.profile?.generalInfo;
    return !!(g?.date_of_birth || g?.nationality);
  }

  get hasWork(): boolean {
    const w = this.profile?.workInfo;
    return !!(w?.position || w?.organization || w?.type || w?.work_start_date);
  }

  get hasExpertise(): boolean {
    const w = this.profile?.workInfo;
    return !!(w?.expertises || w?.interest);
  }

  get headline(): string {
    const w = this.profile?.workInfo;
    return [w?.academic_position, w?.position].filter((v) => !!v && v !== '-').join(' / ');
  }

  get totalWorks(): number {
    return this.projects.length + this.articles.length + this.innovations.length;
  }

  // ── PDF ──────────────────────────────────────────────────────
  /**
   * สร้างไฟล์ PDF (A4) แล้วดาวน์โหลดทันที
   * 1) clone แผ่น CV ไปวางนอกจอที่ความกว้าง A4 (794px)
   * 2) แปลงเป็นภาพด้วย html-to-image (เบราว์เซอร์วาดเอง → สระ/วรรณยุกต์ไทยถูกต้อง)
   * 3) หาจุดตัดหน้าระหว่างรายการ ไม่ตัดกลางบรรทัด แล้ววางลง jsPDF ทีละหน้า
   */
  async downloadPdf(): Promise<void> {
    const sheet = this.sheetRef?.nativeElement;
    if (!sheet || this.exporting) return;
    this.exporting = true;

    const host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = `position:fixed;left:-10000px;top:0;width:${PAGE_W_PX}px;background:#fff;pointer-events:none;`;
    const clone = sheet.cloneNode(true) as HTMLElement;
    clone.classList.add('cv-pdf');
    host.appendChild(clone);
    document.body.appendChild(host);

    try {
      const [{ toCanvas }, { jsPDF }] = await Promise.all([
        import('html-to-image'),
        import('jspdf'),
      ]);

      await (document as any).fonts?.ready;
      await this.waitImages(clone);

      const totalH = Math.ceil(clone.getBoundingClientRect().height);
      const pages = this.paginate(totalH, this.collectBreakPoints(clone));
      const links = this.collectLinks(clone);

      const ratio = Math.min(2, MAX_CANVAS_PX / totalH);
      const canvas = await toCanvas(clone, {
        pixelRatio: ratio,
        backgroundColor: '#ffffff',
        width: PAGE_W_PX,
        height: totalH,
        cacheBust: true,
        imagePlaceholder: BLANK_PX,
      });

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });

      pages.forEach((pg, i) => {
        if (i > 0) pdf.addPage();

        // ตัดภาพเฉพาะส่วนของหน้านี้
        const hPx = pg.end - pg.start;
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = Math.max(1, Math.round(hPx * ratio));
        const ctx = slice.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(
          canvas,
          0, Math.round(pg.start * ratio), canvas.width, slice.height,
          0, 0, canvas.width, slice.height
        );
        pdf.addImage(
          slice.toDataURL('image/jpeg', 0.92),
          'JPEG',
          0,
          MARGIN_Y_MM,
          A4_W_MM,
          hPx * MM_PER_PX,
          undefined,
          'FAST'
        );

        // แถบเหลืองซ้ายเต็มหน้า
        pdf.setFillColor(242, 203, 5);
        pdf.rect(0, 0, ACCENT_MM, A4_H_MM, 'F');

        // เลขหน้า
        if (pages.length > 1) {
          pdf.setFontSize(8);
          pdf.setTextColor(156, 163, 175);
          pdf.text(`${i + 1} / ${pages.length}`, A4_W_MM - MARGIN_X_MM, A4_H_MM - 6, {
            align: 'right',
          });
        }

        // ทำให้ลิงก์ (Google Scholar ฯลฯ) คลิกได้ใน PDF
        links
          .filter((l) => l.top >= pg.start && l.top + l.height <= pg.end)
          .forEach((l) =>
            pdf.link(
              l.left * MM_PER_PX,
              MARGIN_Y_MM + (l.top - pg.start) * MM_PER_PX,
              l.width * MM_PER_PX,
              l.height * MM_PER_PX,
              { url: l.url }
            )
          );
      });

      const name = (this.profile?.full_name || 'researcher').trim().replace(/[\\/:*?"<>|]/g, '');
      pdf.save(`CV-${name}.pdf`);
    } catch (err) {
      console.error(err);
      Swal.fire('ผิดพลาด', 'สร้างไฟล์ PDF ไม่สำเร็จ ลองใหม่อีกครั้ง', 'error');
    } finally {
      host.remove();
      this.exporting = false;
    }
  }

  /** จุดที่ตัดหน้าได้ = ขอบบนของ section / รายการ (ไม่ใช่รายการแรกหลังหัวข้อ) */
  private collectBreakPoints(root: HTMLElement): number[] {
    const base = root.getBoundingClientRect().top;
    const selector = [
      '.cv-section',
      '.cv-summary',
      '.cv-timeline > li:not(:first-child)',
      '.cv-dl > dt:not(:first-of-type)',
      '.cv-footer',
    ].join(',');
    return Array.from(root.querySelectorAll<HTMLElement>(selector))
      .map((el) => Math.floor(el.getBoundingClientRect().top - base))
      .filter((y) => y > 0)
      .sort((a, b) => a - b);
  }

  /** แบ่งหน้า: เลือกจุดตัดที่ลึกที่สุดที่ยังพอดีหน้า ถ้าไม่มีค่อยตัดตรงขอบ */
  private paginate(total: number, breaks: number[]): PdfPage[] {
    const pages: PdfPage[] = [];
    let start = 0;
    while (start < total) {
      const limit = start + USABLE_H_PX;
      if (limit >= total) {
        pages.push({ start, end: total });
        break;
      }
      const candidates = breaks.filter((b) => b > start + USABLE_H_PX * 0.4 && b <= limit);
      const end = candidates.length ? candidates[candidates.length - 1] : limit;
      pages.push({ start, end });
      start = end;
    }
    return pages;
  }

  private collectLinks(root: HTMLElement): PdfLink[] {
    const r = root.getBoundingClientRect();
    return Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href]')).map((a) => {
      const b = a.getBoundingClientRect();
      return { url: a.href, left: b.left - r.left, top: b.top - r.top, width: b.width, height: b.height };
    });
  }

  private waitImages(root: HTMLElement): Promise<unknown> {
    const imgs = Array.from(root.querySelectorAll('img'));
    return Promise.race([
      Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((r) => {
                img.addEventListener('load', () => r(), { once: true });
                img.addEventListener('error', () => r(), { once: true });
              })
        )
      ),
      new Promise((r) => setTimeout(r, 5000)),
    ]);
  }

  back(): void {
    this.location.back();
  }

  // ── Data helpers ─────────────────────────────────────────────
  private toWorks(items?: ResearchItem[]): CvWork[] {
    return (items ?? [])
      .map((i) => ({
        year: this.toBuddhistYear(i.published_date),
        title: (i.title_th || i.title_en || '').trim(),
        titleEn: i.title_th && i.title_en ? i.title_en.trim() : undefined,
        code: i.research_code || undefined,
        _time: i.published_date ? new Date(i.published_date).getTime() || 0 : 0,
      }))
      .filter((w) => w.title.length > 0)
      .sort((a, b) => b._time - a._time) // ใหม่ → เก่า
      .map(({ _time, ...w }) => w);
  }

  private toBuddhistYear(date?: string | Date | null): string {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    let y = d.getFullYear();
    if (y < 2400) y += 543;
    return String(y);
  }

  thaiDate(d: Date): string {
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}