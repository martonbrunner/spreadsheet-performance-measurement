const defaultAllowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export enum ColumnType {
    NUMBER = 0,
    STRING = 1,
    LAST = 2,
}

export type ColumnConfig = {
    field: string;
    title: string;
    type: 'string' | 'number';
};

export type Data = Record<string, string | number | null>;

export function generateColumnConfiguration(numberOfColumns: number): ColumnConfig[] {
    const generate = (columnType: ColumnType): ColumnConfig => {
        const field = randomString(8);
        return {
            field,
            title: field.toUpperCase(),
            type: columnType === ColumnType.STRING ? 'string' : 'number',
        };
    };
    return generateArray(numberOfColumns, () => generate(randomInt(ColumnType.LAST)));
}

export function generateDataForColumnConfiguration(columnConfig: ColumnConfig[], recordCount: number): Data[] {
    return generateArray(recordCount, index => {
        const defaultRecord = { id: index };
        return columnConfig.reduce<Data>((record, column) => {
            record[column.field] = generateFieldValue(column);
            return record;
        }, defaultRecord);
    });
}

function generateFieldValue(column: ColumnConfig) {
    switch (column.type) {
        case 'number':
            return randomBoolean() ? randomFloat(1000) : randomInt(1000);
        case 'string':
            return randomString(randomInt(7) + 3);
        default:
            return null;
    }
}

function generateArray<T>(length: number, fn: (index: number) => T): T[] {
    return Array(length)
        .fill(null)
        .map((_, index) => fn(index));
}

/* Random generator methods */
function randomString(length: number, allowedChars: string = defaultAllowedChars): string {
    return generateArray(length, () => allowedChars[randomInt(allowedChars.length)]).join('');
}

export function randomInt(limit: number): number {
    return Math.floor(Math.random() * limit);
}

function randomFloat(limit: number, digitCount = 3): number {
    const helper = 10 ** digitCount;
    return Math.round(Math.random() * limit * helper) / helper;
}

function randomBoolean(): boolean {
    return Math.random() < 0.5;
}

export type Spreadsheet = {
    init(columnConfig: ColumnConfig[], spreadsheetRecords: Data[]): void;
    colorCell(rowIndex: number, columnName: string, color: string): void;
    colorColumn(columnName: string, color: string): void;
};

export function debounceFunction(fn: Function, delay: number): () => void {
    let timeoutId: number | null = null;
    return () => {
        if (timeoutId !== null) {
            window.clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
            timeoutId = null;
            fn();
        }, delay);
    };
}
