
import { v4 as uuidv4 } from 'uuid';

export interface DnsRecord {
  id: string;
  name: string;
  type: string;
  value: string;
  ttl: string;
  isValid: boolean;
  error?: string;
}

/**
 * Parses BIND DNS configuration text
 * @param bindText BIND configuration text
 * @returns Array of parsed DNS records
 */
export const parseDnsConfig = (bindText: string): DnsRecord[] => {
  const records: DnsRecord[] = [];
  
  // Handle lines with comments
  const lines = bindText.split('\n')
    .map(line => line.replace(/;.*$/, '').trim())
    .filter(line => line.length > 0);
  
  // Get the domain name from SOA record if exists
  let domainName = '';
  const soaLine = lines.find(line => line.includes('SOA'));
  if (soaLine) {
    const soaParts = soaLine.split(/\s+/);
    if (soaParts.length > 0) {
      domainName = soaParts[0].replace(/\.$/, '');
    }
  }
  
  // Process each line
  lines.forEach(line => {
    try {
      // Skip directive lines
      if (line.startsWith('$')) {
        return;
      }
      
      // Parse the record
      const parts = line.split(/\s+/);
      if (parts.length < 3) {
        return;
      }
      
      let name = parts[0];
      let ttl = '';
      let type = '';
      let value = '';
      let idx = 1;
      
      // Handle @ symbol (replace with domain name)
      if (name === '@') {
        name = domainName;
      }
      
      // Check if the second part is TTL
      if (!isNaN(Number(parts[idx]))) {
        ttl = parts[idx];
        idx++;
      }
      
      // Get record type
      if (parts[idx]) {
        type = parts[idx].toUpperCase();
        idx++;
      } else {
        return;
      }
      
      // Get record value based on record type
      switch (type) {
        case 'A':
        case 'AAAA':
          value = parts[idx] || '';
          break;
        case 'CNAME':
        case 'NS':
          value = parts[idx] || '';
          break;
        case 'MX':
          // MX has priority and then hostname
          const priority = parts[idx] || '';
          const hostname = parts[idx + 1] || '';
          value = `${priority} ${hostname}`;
          break;
        case 'TXT':
          // TXT records might be quoted and have multiple parts
          value = parts.slice(idx).join(' ');
          // Remove quotes if present
          value = value.replace(/^"(.*)"$/, '$1');
          break;
        case 'SOA':
          // SOA records have multiple fields
          value = parts.slice(idx).join(' ');
          break;
        default:
          value = parts.slice(idx).join(' ');
      }
      
      // Add the record
      records.push({
        id: uuidv4(),
        name: name.replace(/\.$/, ''),
        type,
        value,
        ttl: ttl || 'Default',
        isValid: Boolean(name && type && value),
        error: !name || !type || !value ? 'Informações incompletas' : undefined
      });
      
    } catch (error) {
      console.error('Error parsing line:', line, error);
    }
  });
  
  return records;
};

/**
 * Converts parsed DNS records to Azion API format
 * @param records Array of parsed DNS records
 * @returns Records formatted for Azion API
 */
export const formatRecordsForAzion = (records: DnsRecord[]) => {
  return records.map(record => {
    // Create a base record object
    const azionRecord: any = {
      name: record.name,
      type: record.type,
      value: record.value,
    };
    
    // Add TTL if it's not the default
    if (record.ttl && record.ttl !== 'Default') {
      azionRecord.ttl = parseInt(record.ttl, 10);
    }
    
    // Handle MX records (separate priority and value)
    if (record.type === 'MX') {
      const mxParts = record.value.split(/\s+/);
      if (mxParts.length >= 2) {
        azionRecord.value = mxParts.slice(1).join(' ');
        azionRecord.priority = parseInt(mxParts[0], 10);
      }
    }
    
    return azionRecord;
  });
};
