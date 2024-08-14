import { Component, TemplateRef, ViewChild, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DateRangeFilterPipe } from './date-range-filter.pipe';
import {MatMenuModule} from '@angular/material/menu';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    DateRangeFilterPipe,
    MatDialogModule,
    RouterOutlet,
    MatFormFieldModule,
    DatePipe,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  displayedColumns = ['title', 'cost', 'startDate', 'endDate', 'source'];
  rowData: any = [];
  today = new Date();
  dataSource = new MatTableDataSource([]);
  title = 'invoicing';
  filterStartDate = signal<any>(null);
  filterEndDate = signal<any>(null);
  invoiceForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    cost: new FormControl('', [Validators.required]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    // source: new FormControl('', [Validators.required]),
  });
  filter = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
  });
  @ViewChild('filterDialog') filterDialog!: TemplateRef<any>;
  downloadJsonHref: any;
  constructor(public dialog: MatDialog,private sanitizer:DomSanitizer) {
    this.rowData = this.getItem();
    console.log(this.rowData);
  }
  addRow() {
    if (this.invoiceForm.valid) {
      this.rowData.push(this.invoiceForm.value);
      this.setItem(this.rowData);
      this.invoiceForm.reset();
    }
  }
  getTotal() {
    debugger
    if (!this.filterStartDate() || !this.filterEndDate()) {
      return this.rowData.reduce((acc: any, curr: any) => {
        return acc + +curr?.cost;
      }, 0);
    }

    const start = new Date(this.filterStartDate());
    const end = new Date(this.filterEndDate());

    return this.rowData.filter((item:any) => {
      const itemStartDate = new Date(item.startDate);
      const itemEndDate = new Date(item.endDate);
      return itemStartDate >= start && itemEndDate <= end;
    }).reduce((acc: any, curr: any) => {
      return acc + +curr?.cost;
    }, 0);
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(this.filterDialog, {
      width: '400px',
      height: '250px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'filter') {
        this.filterStartDate.set(this.filter.value.startDate);
        this.filterEndDate.set(this.filter.value.endDate);
      }
      this.filter.reset()
    });
  }
  deleteRow(index:any){
    if (index > -1 && index < this.rowData.length) {
      this.rowData.splice(index, 1);
    }
      this.rowData = this.rowData;
      this.setItem(this.rowData)
  }
  currentEditRowIndex!:number
  isEditing = signal<boolean>(false)
  enableEditing(item:any,index:any){
    this.currentEditRowIndex = index
    this.isEditing.set(true)
    this.invoiceForm.patchValue(item)
   this.rowData[index] = this.invoiceForm.value
  }
  editRow(){
    this.rowData[this.currentEditRowIndex] = this.invoiceForm.value;
    this.invoiceForm.reset()
    this.setItem(this.rowData)
    this.isEditing.set(false)
  }
  downLoadData() {
    let data = JSON.stringify(this.getItem())
    let uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(data));
    this.downloadJsonHref = uri;
}
  onPrint(divName: string) {
    var mywindow = window.open('', 'PRINT', 'height=600,width=800');
    let table = document.getElementById('invoice');
    let head = `</head><style>.w-100 {width: 100% !important;}.p-15 {padding-left: 15px !important;padding-right: 15px !important;}table {border: 1px solid #EDEDED !important;}th {font-size: 16px;font-weight: 500;padding: 15px;background: #EDEDED !important;}td {padding: 15px;}.w10 {width: 10% !important;} @media print {.noprint { display: none !important;}}</style><body >`;

    // Check if 'mywindow' and 'table' are null
    if (!mywindow || !table) {
      console.error('Window or table not found.');
      return false;
    }

    mywindow.document.write('<html><head>');
    mywindow.document.write(
      '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">'
    );
    mywindow.document.write(
      '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js" integrity="sha384-cuYeSxntonz0PPNlHhBs68uyIAVpIIOZZ5JqeqvYYIcEL727kskC66kF92t6Xl2V" crossorigin="anonymous"></script>'
    );
    mywindow.document.write(head);
    mywindow.document.write('<h1>Invoice</h1>');
    mywindow.document.write(`<h4>${this.today.toDateString()}</h4>`);
    mywindow.document.write(table.innerHTML);
    mywindow.document.write(
      '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>'
    );
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/
    mywindow.document.close();
    mywindow.print();
    // mywindow.close();
    mywindow.document.close(); // necessary for IE >= 10
    return true;
  }
  getItem() {
    let data = JSON.parse(localStorage.getItem('invoiceData') || '[]');
    return data;
  }
  setItem(data: any) {
    data = JSON.stringify(data);
    localStorage.setItem('invoiceData', data);
  }
}
