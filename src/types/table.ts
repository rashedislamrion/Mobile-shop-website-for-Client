export type SelectFilterOption = {
  label: string;
  value: string;
};

export type FilterConfig =
  | {
      type: "select";
      label: string;
      key: string;
      options: SelectFilterOption[];
    }
  | {
      type: "dateRange";
      label: string;
      key: string;
    };

export type TableAction = {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: unknown) => void;
  variant?: "default" | "destructive";
};

export type StatusVariant =
  | "success"   // green (paid, delivered, completed)
  | "warning"   // amber (pending, processing)
  | "danger"    // red (cancelled, failed, due)
  | "info"      // blue (diagnosing, courier)
  | "notice";   // orange (returned, refunded)
