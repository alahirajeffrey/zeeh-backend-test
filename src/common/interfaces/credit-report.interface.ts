export interface CreditReportData {
  score: number;
  risk_band: string;
  enquiries_6m: number;
  defaults: number;
  open_loans: number;
  trade_lines: any[];
}
