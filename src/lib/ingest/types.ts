export type NormalizedIngestEvent = {
  id: string;
  adapter: string;
  occurredAt: string;
  signalId?: string;
  companyId?: string;
  severity: number;
  summary: string;
  raw?: Record<string, unknown>;
};

export type IngestAdapterResult = {
  adapter: string;
  events: NormalizedIngestEvent[];
  message: string;
};

export interface IngestAdapter {
  readonly name: string;
  readonly description: string;
  fetch(): Promise<IngestAdapterResult>;
}
