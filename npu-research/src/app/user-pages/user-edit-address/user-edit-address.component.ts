import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

type DropdownKey = 'address' | 'current_address';

@Component({
  selector: 'app-user-edit-address',
  standalone: false,
  templateUrl: './user-edit-address.component.html',
  styleUrl: './user-edit-address.component.css',
})
export class UserEditAddressComponent {
  openDropdown: DropdownKey | null = null;

  searchAddress = '';
  searchCurrentAddress = '';

  selectedAddress = '';
  selectedCurrentAddress = '';

  constructor(private router: Router) {}

  addresses: string[] = [
    'ตำบลในเมือง อำเภอเมือง จังหวัดขอนแก่น',
    'ตำบลศิลา อำเภอเมือง จังหวัดขอนแก่น',
    'ตำบลบ้านเป็ด อำเภอเมือง จังหวัดขอนแก่น',
    'Nakhon Ratchasima',
  ];
  current_addresses: string[] = [
    'ตำบลในเมือง อำเภอเมือง จังหวัดขอนแก่น',
    'ตำบลศิลา อำเภอเมือง จังหวัดขอนแก่น',
    'ตำบลบ้านเป็ด อำเภอเมือง จังหวัดขอนแก่น',
    'Nakhon Ratchasima',
  ];

  toggle(type: DropdownKey, event: MouseEvent) {
    this.openDropdown = this.openDropdown === type ? null : type;
  }

  isOpen(type: DropdownKey): boolean {
    return this.openDropdown === type;
  }

  // @HostListener('document:click')
  // closeAll() {
  //   this.openDropdown = null;
  // }
  
  closeDropdown() {
    this.openDropdown = null;
  }

  selectAddress(a: string) {
    this.selectedAddress = a;
    this.searchAddress = '';
    this.closeDropdown();
  }

  get filteredAddress(): string[] {
    return this.addresses.filter((a) =>
      a.toLowerCase().includes(this.searchAddress.toLowerCase())
    );
  }

  selectCurrentAddress(a: string) {
    this.selectedCurrentAddress = a;
    this.searchCurrentAddress = '';
    this.closeDropdown();
  }

  get filteredCurrentAddress(): string[] {
    return this.current_addresses.filter((a) =>
      a.toLowerCase().includes(this.searchCurrentAddress.toLowerCase())
    );
  }

  save() {
    if (!this.selectedAddress && !this.selectedCurrentAddress) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณาเลือกที่อยู่ให้ครบถ้วน',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    const payload = {
      address: this.selectedAddress,
      current_address: this.selectedCurrentAddress,
    };

    Swal.fire({
      icon: 'success',
      title: 'บันทึกข้อมูลสำเร็จ',
      text: 'ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว',
      showCancelButton: false,
      timer: 1500,
      timerProgressBar: true
    }).then((result) => {
      this.router.navigateByUrl('/user-profile');
    });
  }
}
