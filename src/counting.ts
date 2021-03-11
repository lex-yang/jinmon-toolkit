import fs from 'fs';
import parse from 'csv-parse/lib/sync';

const fileName = process.argv[2];

interface IDictionary<TValue> {
	[id: string]: TValue;
}

//console.log(`CSV File: ${fileName}`);
const raw = fs.readFileSync(fileName, { encoding: 'utf-8' });
const lines = raw.split('\n');
lines[0] = lines[0].replace(/"/g, '');

const titleLine: string = lines[0];

const csv = lines.join('\n');

//console.log(csv);
const records = parse(csv, {
  trim: true,
  columns: true,
  skip_empty_lines: true,
  skip_lines_with_empty_values: true,
//  skip_lines_with_error: true,
});

const summary: IDictionary<any> = {};

const TRADE_DATE = '交易日期';
const INVESTED = '投入金額';
const PROFIT = '盈虧';

for (let i = 0; i < records.length; i ++) {
  //console.log(`${i + 1} =>`);
  //console.log(records[i]);
  const key: string = records[i][TRADE_DATE];
  if (key in summary) {
    let value: number;

    value = parseFloat(summary[key][INVESTED]);
    summary[key][INVESTED] = value + parseFloat(records[i][INVESTED]);

    value = parseFloat(summary[key][PROFIT]);
    summary[key][PROFIT] = value + parseFloat(records[i][PROFIT]);
  }
  else
    summary[key] = records[i];
}

//console.log(JSON.stringify(summary, null, 2));

const sortedKey = Object.keys(summary).sort((a, b) => {
  const dA = Date.parse(a);
  const dB = Date.parse(b);
  if (dA > dB) return 1
  else if (dA < dB) return -1;
  else return 0;
});

// Output name of fields.
console.log(titleLine);

const titles = titleLine.split(/[,\n]/);
//console.log(titles);

for (let i = sortedKey.length - 1; i >= 0; i --) {
  const key = sortedKey[i];
  const row = summary[key];
  const fields = [];
  for (let t = 0; t < titles.length; t ++) {
    fields.push(`"${row[titles[t]]}"`);
  }
  console.log(fields.join(','));
}

//console.log('Finished !');