
import { DnsRecord } from './types/azionTypes';

/**
 * Gets the apex domain from records
 */
export const getApexDomain = (records: DnsRecord[]): string => {
  // Try to find SOA record first
  const soaRecord = records.find(r => r.type === 'SOA');
  if (soaRecord) {
    return soaRecord.name;
  }
  
  // Try to find NS records
  const nsRecords = records.filter(r => r.type === 'NS');
  if (nsRecords.length > 0) {
    return nsRecords[0].name;
  }
  
  // Try to extract from A or AAAA records
  const aRecords = records.filter(r => r.type === 'A' || r.type === 'AAAA');
  if (aRecords.length > 0) {
    // Find the shortest name which is likely the apex
    let shortest = aRecords[0].name;
    aRecords.forEach(r => {
      if (r.name.length < shortest.length) {
        shortest = r.name;
      }
    });
    return shortest;
  }
  
  return '';
};

/**
 * Utility to chunk an array into smaller arrays
 */
export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};
