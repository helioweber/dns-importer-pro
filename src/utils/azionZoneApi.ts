
import { AzionResponse, AzionSingleResponse, AzionZone } from './types/azionTypes';

/**
 * Finds a zone by name in Azion
 */
export const findZoneByName = async (name: string, apiKey: string): Promise<string> => {
  try {
    const encodedName = encodeURIComponent(name);
    const response = await fetch(`https://api.azion.net/intelligent_dns?name=${encodedName}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json; version=3',
        'Authorization': `Token ${apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json() as AzionResponse<AzionZone>;
    
    if (data.results && data.results.length > 0) {
      return String(data.results[0].id);
    }
    
    throw new Error('Zone not found');
  } catch (error) {
    console.error('Error finding zone by name:', error);
    throw error;
  }
};

/**
 * Creates a new zone in Azion
 */
export const createZone = async (domainName: string, apiKey: string): Promise<string> => {
  try {
    const response = await fetch('https://api.azion.net/intelligent_dns', {
      method: 'POST',
      headers: {
        'Accept': 'application/json; version=3',
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: domainName,
        domain: domainName
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }
    
    const data = await response.json() as AzionSingleResponse<AzionZone>;
    return String(data.results.id);
  } catch (error) {
    console.error('Error creating zone:', error);
    throw error;
  }
};
