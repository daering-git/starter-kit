// Dashboard feature types — add your domain types here

export type DashboardStat = {
  id: string;
  label: string;
  value: number | string;
  trend?: number;
};
