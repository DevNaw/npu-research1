import { NativeDateAdapter } from '@angular/material/core';
import { Injectable } from '@angular/core';

@Injectable()
export class BuddhistDateAdapter extends NativeDateAdapter {
  // แสดงปีเป็น พ.ศ. (บวก 543)
  override getYearName(date: Date): string {
    return String(date.getFullYear() + 543);
  }

  // format ที่โชว์ในช่อง input — dd/mm/พ.ศ.
  override format(date: Date, displayFormat: Object): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  }
}

export const BUDDHIST_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};