import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSpaces(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function buildEcontFullAddress(office) {
  const addr = office?.address || {};
  const cityName = addr?.city?.name || office?.city?.name || '';

  const directFullAddress =
    addr?.fullAddress ||
    addr?.fullAddressString ||
    addr?.fullAddressEn ||
    addr?.fulladdress ||
    '';

  if (directFullAddress && String(directFullAddress).trim()) {
    return normalizeSpaces(directFullAddress);
  }

  const parts = [];

  if (cityName) {
    parts.push(`гр. ${cityName}`);
  }

  if (addr?.quarter) {
    parts.push(`жк ${addr.quarter}`);
  }

  if (addr?.street) {
    const streetValue = String(addr.street).trim();
    const hasPrefix = /^(ул\.|улица|бул\.|булевард)/i.test(streetValue);
    parts.push(hasPrefix ? streetValue : `ул. ${streetValue}`);
  }

  if (addr?.num) {
    parts.push(`No ${addr.num}`);
  }

  if (addr?.other) {
    parts.push(addr.other);
  }

  return normalizeSpaces(parts.join(' '));
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
    process.env.ECONT_USERNAME ||
    process.env.NEXT_PUBLIC_ECONT_USERNAME ||
    'iasp-dev';

  const password =
    process.env.ECONT_PASSWORD ||
    process.env.NEXT_PUBLIC_ECONT_PASSWORD ||
    '1Asp-dev';

  const baseUrl =
    process.env.ECONT_BASE_URL ||
    process.env.NEXT_PUBLIC_ECONT_BASE_URL ||
    'https://demo.econt.com/ee/services';

  if (!username || !password) {
    return NextResponse.json(
      {
        error:
          'Missing Econt credentials. Please set ECONT_USERNAME and ECONT_PASSWORD.',
      },
      { status: 500 }
    );
  }

  const endpoint = `${baseUrl}/Nomenclatures/NomenclaturesService.getOffices.json`;

  const body = { countryCode: 'BGR' };
  if (city) {
    body.city = { name: city };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from(`${username}:${password}`, 'utf-8').toString('base64'),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { error: 'Failed to fetch Econt offices', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json().catch(() => null);
    let offices = data?.offices || [];

    if (city) {
      const cityLower = city.toLowerCase();

      offices = offices.filter((office) => {
        const officeCity =
          office?.address?.city?.name ||
          office?.city?.name ||
          '';

        return officeCity.toLowerCase().includes(cityLower);
      });
    }

    const seen = new Set();
    const result = [];

    for (const office of offices) {
      const cityName =
        office?.address?.city?.name ||
        office?.city?.name ||
        '';

      const fullAddress = buildEcontFullAddress(office);
      if (!fullAddress) continue;

      const dedupeKey = fullAddress.toLowerCase();
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const street = extractStreetForSort(fullAddress);
      const officeName = office?.name || office?.officeName || '';

      const isAps =
        office?.isAPS === true ||
        office?.isAps === true ||
        office?.aps === true ||
        /aps|апс|еконтомат|24\/7/i.test(String(officeName));

      result.push({
        id: office?.id || office?.code || fullAddress,
        city: cityName,
        address: fullAddress,
        street,
        isAps,
      });
    }

    return NextResponse.json({ offices: result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching Econt offices', details: error.message },
      { status: 500 }
    );
  }
}