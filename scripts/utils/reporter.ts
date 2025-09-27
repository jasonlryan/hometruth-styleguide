import fs from 'fs';
import os from 'os';
import path from 'path';

import { ReportFormat } from './common';

type CsvCell = string | number | boolean | null | undefined;

export interface ReporterOptions<T extends { status: string }> {
  formats: ReportFormat[];
  version: string;
  filePrefix: string;
  basePath?: string;
  summaryStatuses?: string[];
  csvHeaders?: string[];
  csvRow?: (record: T & { reportVersion: string }) => CsvCell[];
  transformRecord?: (record: T & { reportVersion: string }) => Record<string, unknown>;
}

export class Reporter<T extends { status: string }> {
  private readonly targets: Set<ReportFormat>;
  private readonly version: string;
  private readonly summaryStatuses: string[];
  private jsonlStream?: fs.WriteStream;
  private csvStream?: fs.WriteStream;
  private records: Array<T & { reportVersion: string }> = [];
  private readonly csvRow?: (record: T & { reportVersion: string }) => CsvCell[];
  private readonly transformRecord?: (record: T & { reportVersion: string }) => Record<string, unknown>;

  constructor(options: ReporterOptions<T>) {
    this.targets = new Set(options.formats);
    this.version = options.version;
    this.summaryStatuses = options.summaryStatuses ?? [];
    this.csvRow = options.csvRow;
    this.transformRecord = options.transformRecord;

    if (this.targets.size === 0) {
      return;
    }

    const reportDir = options.basePath ? path.dirname(options.basePath) : path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = options.basePath
      ? path.basename(options.basePath, path.extname(options.basePath))
      : `${options.filePrefix}-${timestamp}`;

    if (this.targets.has('jsonl')) {
      const useExplicit = Boolean(options.basePath && this.targets.size === 1 && options.basePath.endsWith('.jsonl'));
      const jsonlPath = useExplicit
        ? (options.basePath as string)
        : path.join(reportDir, `${baseName}.jsonl`);
      this.jsonlStream = fs.createWriteStream(jsonlPath, { flags: 'a' });
      this.jsonlStream.write(
        `${JSON.stringify({ reportVersion: this.version, startedAt: new Date().toISOString() })}${os.EOL}`,
      );
    }

    if (this.targets.has('csv')) {
      if (!options.csvHeaders || !this.csvRow) {
        throw new Error('CSV format requested but csvHeaders or csvRow missing');
      }

      const useExplicit = Boolean(options.basePath && this.targets.size === 1 && options.basePath.endsWith('.csv'));
      const csvPath = useExplicit ? (options.basePath as string) : path.join(reportDir, `${baseName}.csv`);
      const exists = fs.existsSync(csvPath);
      this.csvStream = fs.createWriteStream(csvPath, { flags: 'a' });
      if (!exists) {
        this.csvStream.write(`${options.csvHeaders.join(',')}${os.EOL}`);
      }
    }
  }

  record(entry: T) {
    const enriched: T & { reportVersion: string } = { ...entry, reportVersion: this.version };
    this.records.push(enriched);

    if (this.jsonlStream) {
      const payload = this.transformRecord ? this.transformRecord(enriched) : enriched;
      this.jsonlStream.write(`${JSON.stringify(payload)}${os.EOL}`);
    }

    if (this.csvStream && this.csvRow) {
      const row = this.csvRow(enriched);
      const serialized = row
        .map((value) => {
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
          }
          const str = value.replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',');
      this.csvStream.write(`${serialized}${os.EOL}`);
    }
  }

  summary(): Record<string, number> {
    const totals: Record<string, number> = { total: this.records.length };
    for (const status of this.summaryStatuses) {
      totals[status] = 0;
    }

    for (const record of this.records) {
      const { status } = record;
      if (totals[status] == null) {
        totals[status] = 0;
      }
      totals[status] += 1;
    }

    return totals;
  }

  close() {
    this.jsonlStream?.end();
    this.csvStream?.end();
  }

  getRecords(): Array<T & { reportVersion: string }> {
    return this.records;
  }
}
