import { NextResponse } from 'next/server';

function normalizeSpaces(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function buildSpeedyFullAddress(office) {
  const addressObj = office?.address || {};
  const cityName =
    office?.siteName ||
    addressObj?.site?.name ||
    addressObj?.siteName ||
    '';

  const directFullAddress =
    office?.fullAddressString ||
    addressObj?.fullAddressString ||
    addressObj?.siteAddressString ||
    addressObj?.localAddressString ||
    '';

  if (directFullAddress && String(directFullAddress).trim()) {
    return normalizeSpaces(directFullAddress);
  }

  const line1 =
    office?.addressLine1 ||
    addressObj?.addressLine1 ||
    addressObj?.line1 ||
    addressObj?.streetName ||
    '';

  const line2 =
    office?.addressLine2 ||
    addressObj?.addressLine2 ||
    addressObj?.line2 ||
    addressObj?.streetNo ||
    '';

  const note =
    office?.addressNote ||
    addressObj?.addressNote ||
    '';

  const parts = [];
  if (cityName) parts.push(cityName);
  if (line1) parts.push(line1);
  if (line2) parts.push(line2);
  if (note) parts.push(note);

  const fallback = normalizeSpaces(parts.join(' '));

  if (fallback) {
    return fallback;
  }

  return normalizeSpaces(office?.name || office?.officeName || '');
}

function extractStreetForSort(address = '') {
  const normalized = normalizeSpaces(address);

  const markerMatch = normalized.match(
    /\b(бул\.|булевард|ул\.|улица)\s+([^,]+)$/i
  );

  if (markerMatch?.[2]) {
    return normalizeSpaces(markerMatch[2])
      .replace(/\b(No|№)\s*\S+.*$/i, '')
      .replace(/\bвх\.\s*\S+.*$/i, '')
      .replace(/\bет\.\s*\S+.*$/i, '')
      .replace(/\bап\.\s*\S+.*$/i, '')
      .trim();
  }

  return normalized;
}

export async function GET(request) {
  const url = new URL(request.url);
  const city = url.searchParams.get('city')?.trim();

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
      {
        error:
          'Missing Speedy credentials. Please set SPEEDY_USERNAME and SPEEDY_PASSWORD.',
      },
      { status: 500 }
    );
  }

  const endpoint = `${baseUrl}/location/office/`;

  const payload = {
    userName: username,
    password,
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

    const seen = new Set();
    const result = [];

    for (const office of offices) {
      const cityName =
        office?.siteName ||
        office?.address?.site?.name ||
        office?.address?.siteName ||
        '';

      const fullAddress = buildSpeedyFullAddress(office);
      if (!fullAddress) continue;

      const dedupeKey = fullAddress.toLowerCase();
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const street = extractStreetForSort(fullAddress);
      const officeType = office?.officeType || office?.type || '';
      const officeName = office?.name || office?.officeName || '';

      const isAps =
        String(officeType).toUpperCase() === 'APT' ||
        /апт|автомат|locker|24\/7/i.test(String(officeName));

      result.push({
        id: office?.id || office?.officeId || office?.code || fullAddress,
        city: cityName,
        address: fullAddress,
        street,
        isAps,
      });
    }

    return NextResponse.json({ offices: result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching Speedy offices', details: error.message },
      { status: 500 }
    );
  }
}