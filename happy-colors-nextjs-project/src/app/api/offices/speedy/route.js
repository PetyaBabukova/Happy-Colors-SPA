// happy-colors-nextjs-project/src/app/api/offices/speedy/route.js
/**
 * API route used to fetch a list of Speedy offices. This endpoint proxies
 * requests to the Speedy Location Service (FindOffice) and returns a simple
 * array of office labels. Credentials are kept on the server and are not
 * exposed to the client. A `city` query parameter may be passed to narrow the
 * search using Speedy’s `siteName` filter; when omitted all Bulgarian offices
 * are returned (up to the specified limit).
 */

import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const city = url.searchParams.get('city')?.trim();

  // If credentials are not provided via env, fall back to demo credentials.
  // These test credentials are provided by Speedy and are linked to a dummy object,
  // so that no amounts accumulate on a real contract. They work against
  // Speedy's live system but should be replaced with your own credentials in production.
  const username =
    process.env.SPEEDY_USERNAME ||
    process.env.NEXT_PUBLIC_SPEEDY_USERNAME ||
    '1996389';
  const password =
    process.env.SPEEDY_PASSWORD ||
    process.env.NEXT_PUBLIC_SPEEDY_PASSWORD ||
    '7342986798';
  const baseUrl =
    process.env.SPEEDY_BASE_URL ||
    process.env.NEXT_PUBLIC_SPEEDY_BASE_URL ||
    'https://api.speedy.bg/v1';

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Missing Speedy credentials. Please set SPEEDY_USERNAME and SPEEDY_PASSWORD.' },
      { status: 500 }
    );
  }

  const endpoint = `${baseUrl}/location/office/`;
  // Construct the payload according to Speedy’s FindOfficeRequest. We always
  // specify countryId=100 (Bulgaria) and request a large limit to receive all
  // available offices. When a city is provided we use `siteName` to filter
  // offices by town. See Speedy’s documentation for further filtering options.
  const payload = {
    userName: username,
    password: password,
    language: 'BG',
    countryId: 100,
    limit: 1000,
  };
  if (city) {
    payload.siteName = city;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { error: 'Failed to fetch Speedy offices', details: errorText },
        { status: response.status }
      );
    }
    const data = await response.json().catch(() => null);
    const offices = data?.offices || [];
    // Compose readable labels for each office. The API returns `siteName` for
    // the town and `name` for the office; some versions also expose
    // `officeName`. We include both when available.
    const list = offices.map((office) => {
      const cityName = office?.siteName || office?.address?.site?.name || '';
      const name = office?.name || office?.officeName || '';
      if (cityName && name) return `${cityName} – ${name}`;
      return name || cityName;
    });
    return NextResponse.json({ offices: list });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching Speedy offices', details: error.message },
      { status: 500 }
    );
  }
}