// happy-colors-nextjs-project/src/app/api/offices/econt/route.js
/**
 * API route used to fetch a list of Econt offices. This endpoint lives on the
 * Next.js server and acts as a thin proxy around Econt’s own JSON API. By
 * forwarding requests through a server‑side route we avoid leaking courier
 * credentials to the client and bypass CORS restrictions. The optional
 * `city` query parameter may be provided to narrow the results to a specific
 * city, but falls back to returning all Bulgarian offices when omitted.
 */

import { NextResponse } from 'next/server';
// Import Buffer explicitly for environments where it is not available
import { Buffer } from 'buffer';

export async function GET(request) {
  const url = new URL(request.url);
  const city = url.searchParams.get('city')?.trim();

  // Credentials and API base URL are read from environment variables. When
  // deploying to production you should configure these via a `.env.local` or
  // secrets manager. The defaults point to Econt’s demo environment.
  // Use environment variables when available, otherwise fall back to the demo credentials
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
    // Default to Econt demo environment when no BASE_URL is provided
    'https://demo.econt.com/ee/services';

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Missing Econt credentials. Please set ECONT_USERNAME and ECONT_PASSWORD.' },
      { status: 500 }
    );
  }

  const endpoint = `${baseUrl}/Nomenclatures/NomenclaturesService.getOffices.json`;

  // Build the request body. The Econt API accepts a country code to limit
  // returned offices. When a city name is supplied we try to filter by it.
  const body = { countryCode: 'BGR' };
  if (city) {
    // According to Econt’s nomenclature service, you can filter offices by
    // providing a `city` object. If the API ignores this field it will simply
    // return all offices in Bulgaria.
    body.city = { name: city };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Construct the Basic auth header. Buffer is imported explicitly above
        Authorization:
          'Basic ' + Buffer.from(`${username}:${password}`, 'utf-8').toString('base64'),
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
    /**
     * Helper functions to transliterate between Cyrillic and Latin. These are
     * simple character maps that cover the most common Bulgarian letters. The
     * transliteration is approximate but sufficient for matching city names
     * entered in Latin (e.g. "Sofia") against their Cyrillic counterparts
     * ("София") and vice versa. If a character is not found in the map it is
     * returned unchanged.
     */
    const cyrToLatMap = {
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sht', ъ: 'a', ь: 'y', ю: 'yu', я: 'ya', ѝ: 'i'
    };
    const latToCyrMap = {
      a: 'а', b: 'б', v: 'в', g: 'г', d: 'д', e: 'е', z: 'з', i: 'и', y: 'й', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р', s: 'с', t: 'т', u: 'у', f: 'ф', h: 'х', c: 'ц', q: 'я', w: 'в', x: 'кс', j: 'й'
    };
    function cyrToLat(str = '') {
      return str
        .split('')
        .map((ch) => cyrToLatMap[ch] || cyrToLatMap[ch.toLowerCase()] || ch)
        .join('');
    }
    function latToCyr(str = '') {
      return str
        .split('')
        .map((ch) => latToCyrMap[ch] || latToCyrMap[ch.toLowerCase()] || ch)
        .join('');
    }

    // Filter offices by city if a query parameter is provided. The filtering
    // compares the input city in both Latin and Cyrillic forms against the
    // office’s city name. We perform substring matching so that partial
    // matches still succeed (e.g. "sofi" matches "София").
    if (city) {
      const cityLower = city.toLowerCase();
      const cityCyr = latToCyr(cityLower);
      offices = offices.filter((office) => {
        const cityName = office?.address?.city?.name || office?.city?.name || '';
        const cityNameLower = (cityName || '').toLowerCase();
        const cityNameLat = cyrToLat(cityNameLower);
        return (
          cityNameLower.includes(cityLower) ||
          cityNameLower.includes(cityCyr) ||
          cityNameLat.includes(cityLower)
        );
      });
    }

    // Transform the filtered offices into richer objects with address information
    // and an informative label. The label is built from the full address and
    // optionally prefixed with "24/7 Еконтомат" when the office represents
    // an automated post station (APS). We look for several possible flags
    // indicating an APS: isAPS, isAps, isAPS, apsType, or a name containing
    // "апс" (case-insensitive). When no full address is available we
    // construct one from street and number fields.
    const result = offices.map((office) => {
      const cityName = office?.address?.city?.name || office?.city?.name || '';
      const addr = office?.address || {};
      let address =
        addr?.fullAddress ||
        addr?.fullAddressString ||
        addr?.fullAddressEn ||
        addr?.fulladdress ||
        '';
      if (!address) {
        const parts = [];
        if (cityName) parts.push(cityName);
        if (addr?.street) parts.push(addr.street);
        if (addr?.num) parts.push(addr.num);
        if (addr?.other) parts.push(addr.other);
        address = parts.join(', ');
      }
      // Determine if this office is an Econtomat (APS) based on various fields
      const name = office?.name || office?.officeName || '';
      const apsFlags = [office?.isAPS, office?.isAps, office?.isAps, office?.aps, office?.apsType];
      const isAps = apsFlags.some((v) => v === true || (typeof v === 'string' && /aps|апс|еконтамат/i.test(v))) || /апс|еконтамат|24\/7/i.test(name);
      const label = isAps ? `24/7 Еконтомат | ${address}` : address;
      return {
        id: office?.id || office?.code || null,
        city: cityName,
        address,
        label,
        isAps,
      };
    });
    return NextResponse.json({ offices: result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching Econt offices', details: error.message },
      { status: 500 }
    );
  }
}