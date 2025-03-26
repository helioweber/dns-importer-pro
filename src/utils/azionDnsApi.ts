
/**
 * Adds a single DNS record to Azion
 */
export const addDnsRecord = async (record: any, zoneId: string, apiKey: string): Promise<any> => {
  try {
    const response = await fetch(`https://api.azion.net/intelligent_dns/${zoneId}/records`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json; version=3',
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(record)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding DNS record:', error);
    throw error;
  }
};
