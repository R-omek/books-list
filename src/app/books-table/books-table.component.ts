import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { distinctUntilChanged, switchMap } from 'rxjs';
import { ApiService } from 'src/shared/services/api.service';
import * as FileSaver from 'file-saver';
import { ColsType } from 'src/shared/models/columns-type';


@Component({
  selector: 'app-books-table',
  templateUrl: './books-table.component.html',
  styleUrls: ['./books-table.component.scss']
})
export class BooksTableComponent implements OnInit {

  books: object[] = []
  loading: boolean = true;
  isClicked: boolean = false
  showModal: boolean = false

  exportColumns!: object[];
  cols!: ColsType[];

  @ViewChild("table") table!: Table;

  searchInput = new FormControl('')

  editForm = new FormGroup({
    id: new FormControl(null),
    title: new FormControl(null, Validators.required),
    pageCount: new FormControl(null, Validators.required),
    publishDate: new FormControl(new Date(), Validators.required),
    description: new FormControl(null, Validators.required)
  })

  constructor(
    private api: ApiService
  ) { }

  ngOnInit(): void {

    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'title', header: 'Title' },
      { field: 'pageCount', header: 'Page Count' },
      { field: 'publishDate', header: 'Publish Date' },
      { field: 'description', header: 'Description' },
    ]

    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));

    this.api.getBooks().subscribe(
      (resp: object[]) => {
        this.books = resp
        this.loading = false
      }
    )

    this.searchInput.valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe(
      (inputValue: string | null) => {
        this.table.filterGlobal(inputValue, 'contains')
      }
    )
  }

  addNewBook() {
    const date = new Date()
    this.editForm.reset({
      publishDate: date
    })
    this.showModal = true;
  }

  editBook(book: object) {
    this.editForm.reset(book)
    this.showModal = true;
  }

  saveBook() {
    if (!this.editForm.valid) {
      return this.editForm.markAllAsTouched();
    }

    const functionName = this.editForm.value.id ? "updateBook" : "createBook";
    this.api[functionName](this.editForm.value, this.books.length).pipe(
      switchMap(() => this.api.getBooks())
    ).subscribe(
      () => {
        this.table.reset()
        this.showModal = false
      }
    )
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.books);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: ArrayBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      console.log(excelBuffer)
      this.saveAsExcelFile(excelBuffer, "products");
    });
  }

  saveAsExcelFile(buffer: ArrayBuffer, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  exportPdf() {
    import("jspdf").then(jsPDF => {
      import("jspdf-autotable").then(() => {
        const doc = new jsPDF.default('l', 'mm', 'a4');
        (doc as any).autoTable(this.exportColumns, this.books);
        doc.save('books.pdf');
      })
    })
  }

}
