import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { ColumnConfig, Data, Spreadsheet, debounceFunction } from '../utils';

export class HandsonSpreadsheet implements Spreadsheet {
    private readonly element: Element;
    private handsontable: Handsontable | null = null;
    private columnConfig: ColumnConfig[] | null = null;
    private bgColors: string[][] = [];
    private columnBgColors: string[] = [];
    private readonly debounceRender: () => void;

    constructor(element: Element) {
        this.element = element;
        this.debounceRender = debounceFunction(() => {
            this.handsontable?.render();
        }, 200);
    }

    init(columnConfig: ColumnConfig[], spreadsheetRecords: Data[]) {
        if (this.handsontable !== null) {
            this.handsontable.destroy();
        }

        this.columnConfig = columnConfig;
        this.handsontable = new Handsontable(this.element, {
            data: spreadsheetRecords,
            colHeaders: columnConfig.map(c => c.title),
            columns: columnConfig.map(c => ({
                type: c.type === 'string' ? 'text' : 'numeric',
                data: c.field,
                renderer: (instance, td, row, col, prop, value, cellProperties) => {
                    const color = this.columnBgColors[col] || this.bgColors[row]?.[col] || 'unset';
                    td.style.backgroundColor = color;
                    td.innerHTML = value;
                },
            })),
        });
    }

    colorCell(rowIndex: number, columnName: string, color: string) {
        if (this.handsontable !== null && this.columnConfig !== null) {
            const columnIndex = this.columnConfig?.findIndex(c => c.field === columnName);
            if (this.bgColors[rowIndex] === undefined) {
                this.bgColors[rowIndex] = [];
            }
            this.bgColors[rowIndex][columnIndex] = color;
            this.debounceRender();
        }
    }

    colorColumn(columnName: string, color: string) {
        if (this.handsontable !== null && this.columnConfig !== null) {
            const columnIndex = this.columnConfig?.findIndex(c => c.field === columnName);
            this.columnBgColors[columnIndex] = color;
            this.debounceRender();
        }
    }
}
