const SUPABASE_URL = 'https://ufoyjedhkcosveptddmj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmb3lqZWRoa2Nvc3ZlcHRkZG1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODkxNjE0MiwiZXhwIjoyMDk0NDkyMTQyfQ.Zft5GGzS7uceo6elXCpk-sHisFltjUV-sSUrOugQSV0';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

async function sbFetch(path, method = 'GET', body = null, prefer = '') {
  const opts = { method, headers: { ...headers } };
  if (prefer) opts.headers['Prefer'] = prefer;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text ? JSON.parse(text) : [];
}

export async function handler(event) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const { action, table, rows, col, val } = JSON.parse(event.body || '{}');

    let result;

    switch (action) {
      case 'getAll':
        result = await sbFetch(`${table}?order=created_at.desc`);
        break;

      case 'upsertMany': {
        if (!rows || !rows.length) { result = []; break; }
        const pk = table === 'registros' ? 'id' : 'email';
        result = await sbFetch(
          `${table}?on_conflict=${pk}`,
          'POST',
          rows,
          'resolution=merge-duplicates,return=minimal'
        );
        break;
      }

      case 'delete':
        result = await sbFetch(`${table}?${col}=eq.${val}`, 'DELETE');
        break;

      default:
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Unknown action' })
        };
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(result ?? [])
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message })
    };
  }
}
