interface AsaasClient {
  baseUrl: string;
  apiKey: string;
}

export function createAsaasClient(apiKey: string | undefined): AsaasClient {
  if (!apiKey) {
    throw new Error('ASAAS_API_KEY é obrigatória');
  }
  const baseUrl = apiKey.startsWith('$aact_')
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/v3';
  return { baseUrl, apiKey };
}

async function asaasFetch(client: AsaasClient, path: string, options: RequestInit = {}) {
  const res = await fetch(`${client.baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      access_token: client.apiKey,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Asaas API error (${res.status}): ${error}`);
  }

  return res.json();
}

export async function findOrCreateCustomer(
  client: AsaasClient,
  email: string,
  name: string
): Promise<string> {
  const search = await asaasFetch(client, `/customers?email=${encodeURIComponent(email)}`);

  if (search.data && search.data.length > 0) {
    return search.data[0].id;
  }

  const customer = await asaasFetch(client, '/customers', {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  });

  return customer.id;
}

interface CreatePaymentParams {
  customerId: string;
  value: number;
  description: string;
  externalReference: string;
  installmentCount?: number;
  installmentValue?: number;
  successUrl: string;
}

export async function createPayment(
  client: AsaasClient,
  params: CreatePaymentParams
): Promise<string> {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  const dueDateStr = dueDate.toISOString().split('T')[0];

  const body: Record<string, unknown> = {
    customer: params.customerId,
    billingType: 'UNDEFINED',
    value: params.value,
    dueDate: dueDateStr,
    description: params.description,
    externalReference: params.externalReference,
    callback: {
      successUrl: params.successUrl,
      autoRedirect: true,
    },
  };

  if (params.installmentCount && params.installmentCount > 1) {
    body.installmentCount = params.installmentCount;
    body.installmentValue = params.installmentValue;
  }

  const payment = await asaasFetch(client, '/payments', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return payment.invoiceUrl;
}
