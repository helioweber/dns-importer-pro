
export interface DnsRecord {
  id: string;
  name: string;
  type: string;
  value: string;
  ttl: string;
  isValid: boolean;
  error?: string;
}

export interface ImportConfig {
  apiKey: string;
  zoneId?: string;
  onProgress?: (progress: number, importedCount: number) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export interface AzionZone {
  id: number;
  name: string;
  domain: string;
  is_active: boolean;
}

export interface AzionResponse<T> {
  results: T[];
  total?: number;
}

export interface AzionSingleResponse<T> {
  results: T;
}
