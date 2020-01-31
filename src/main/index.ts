/* eslint-disable no-console */
import '@progress/kendo-ui';
import '@progress/kendo-ui/css/web/kendo.common.min.css';
import '@progress/kendo-ui/css/web/kendo.default.min.css';

import { generateColumnConfiguration, generateDataForColumnConfiguration, randomInt } from './utils';
import { KendoSpreadsheet } from './kendo';
import { HandsonSpreadsheet } from './handsontable';

import './index.scss';

const kendoSpreadsheet = new KendoSpreadsheet($('#kendo-spreadsheet'));
const handsonSpreadsheet = new HandsonSpreadsheet($('#handsontable').get(0));

const numberOfRows = 5000;
const numberOfColumns = 200;

const columnConfiguration = generateColumnConfiguration(numberOfColumns);
const data = generateDataForColumnConfiguration(columnConfiguration, numberOfRows);

$('#create-kendo-spreadsheet').on('click', () => {
    console.time('kendo-init');
    kendoSpreadsheet.init(columnConfiguration, data);
    console.timeEnd('kendo-init');
});

$('#create-handsontable').on('click', () => {
    console.time('handsontable-init');
    handsonSpreadsheet.init(columnConfiguration, data);
    console.timeEnd('handsontable-init');
});

$('#color-cells-button').on('click', () => {
    for (let i = 0; i < numberOfRows * 2; i += 1) {
        const rowIndex = randomInt(numberOfRows);
        const columnName = columnConfiguration[randomInt(columnConfiguration.length)].field;
        kendoSpreadsheet.colorCell(rowIndex, columnName, 'red');
        handsonSpreadsheet.colorCell(rowIndex, columnName, 'red');
    }
    for (let i = 0; i < numberOfColumns * 0.4; i += 1) {
        const columnName = columnConfiguration[randomInt(columnConfiguration.length)].field;
        kendoSpreadsheet.colorColumn(columnName, 'lightgreen');
        handsonSpreadsheet.colorColumn(columnName, 'lightgreen');
    }
});
