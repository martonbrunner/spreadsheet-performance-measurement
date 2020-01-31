import './kendo.scss';
import { ColumnConfig, Data, Spreadsheet, debounceFunction } from '../utils';

export class KendoSpreadsheet implements Spreadsheet {
    private readonly element: JQuery;
    private spreadsheet: kendo.ui.Spreadsheet | null = null;
    private columnConfig: ColumnConfig[] | null = null;
    private scheduledStylings: Function[] = [];
    private readonly debounceStyling: (fn: Function) => void;

    constructor(element: JQuery) {
        this.element = element;

        const debouncedFunction = debounceFunction(() => {
            this.spreadsheet?.activeSheet().batch(() => {
                this.scheduledStylings.forEach(fn => fn());
                this.scheduledStylings = [];
            }, null);
        }, 200);

        this.debounceStyling = (fn: Function) => {
            this.scheduledStylings.push(fn);
            debouncedFunction();
        };
    }

    init(columnConfig: ColumnConfig[], spreadsheetRecords: Data[]) {
        if (this.spreadsheet !== null) {
            this.spreadsheet.destroy();
            this.element.empty();
        }

        this.columnConfig = columnConfig;
        this.spreadsheet = this.element
            .width('100%')
            .kendoSpreadsheet({
                rows: spreadsheetRecords.length + 1,
                columns: columnConfig.length,
                toolbar: false,
                sheetsbar: false,
                sheets: [{}],
            })
            .data('kendoSpreadsheet');

        const dataSource = this.getKendoDataSource(columnConfig, spreadsheetRecords);
        this.spreadsheet.activeSheet().setDataSource(dataSource, columnConfig);
    }

    colorCell(rowIndex: number, columnName: string, color: string) {
        this.debounceStyling(() => {
            this.getRange(rowIndex + 1, columnName)?.background(color);
        });
    }

    colorColumn(columnName: string, color: string) {
        this.debounceStyling(() => {
            if (this.spreadsheet !== null && this.columnConfig !== null) {
                const columnIndex = this.columnConfig.findIndex(c => c.field === columnName);
                const sheet: CustomSheet = this.spreadsheet.activeSheet() as CustomSheet;
                sheet.range(1, columnIndex, sheet.dataSource.total()).background(color);
            }
        });
    }

    private getKendoDataSource(columnConfig: ColumnConfig[], spreadsheetRecords: Data[]) {
        return new kendo.data.DataSource({
            data: spreadsheetRecords,
            schema: {
                model: {
                    id: 'offerSkuLineId',
                    fields: columnConfig.reduce<KendoModelFields>((memo, column) => {
                        memo[column.field] = { type: column.type };
                        return memo;
                    }, {}),
                },
            },
        });
    }

    private getRange(rowIndex: number, columnName: string): kendo.spreadsheet.Range | undefined {
        if (this.spreadsheet !== null && this.columnConfig !== null) {
            const columnIndex = this.columnConfig.findIndex(c => c.field === columnName);
            return this.spreadsheet.activeSheet().range(rowIndex, columnIndex);
        }
        return undefined;
    }
}

type KendoModelFields = Record<string, { type: ColumnConfig['type'] }>;
type CustomSheet = kendo.spreadsheet.Sheet & { dataSource: kendo.data.DataSource };
