// server/services/deliveryService.js

class DeliveryError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const SPEEDY_BASE_URL = process.env.SPEEDY_BASE_URL || 'https://api.speedy.bg/v1';
const ECONT_BASE_URL =
  process.env.ECONT_BASE_URL || 'https://demo.econt.com/ee/services';

function requireEnv(name) {
  const value = process.env[name];
  if (!value || String(value).trim() === '') {
    throw new DeliveryError(`${name} не е конфигуриран на сървъра.`, 500);
  }

  return value;
}

function sanitizeText(value) {
  return String(value ?? '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();
}

function normalizeText(value) {
  return sanitizeText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function dedupeByValue(items = []) {
  return Array.from(new Set(items.filter(Boolean)));
}

function buildOfficeLabel({
  carrier,
  officeId,
  officeCode,
  officeName,
  cityName,
  address,
}) {
  const parts = [
    officeName ? `${carrier}: ${officeName}` : carrier,
    cityName || '',
    address || '',
  ].filter(Boolean);

  return {
    id: String(officeId || officeCode || officeName || Math.random()),
    code: officeCode ? String(officeCode) : '',
    name: officeName || '',
    city: cityName || '',
    address: address || '',
    label: parts.join(' | '),
  };
}

/* -----------------------------
   ECONT
----------------------------- */

async function fetchEcontJson(endpoint, body = {}) {
  const username = requireEnv('ECONT_USERNAME');
  const password = requireEnv('ECONT_PASSWORD');

  const response = await fetch(`${ECONT_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:
        'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new DeliveryError(
      data?.message || 'Econt API върна неуспешен отговор.',
      response.status
    );
  }

  if (data?.error) {
    throw new DeliveryError(
      data.error?.message || 'Econt API върна грешка.',
      400
    );
  }

  return data;
}

async function getEcontCityIdByName(cityName) {
  const cleanCity = sanitizeText(cityName);

  if (!cleanCity) {
    throw new DeliveryError('Липсва град за търсене в Еконт.', 400);
  }

  const citiesResponse = await fetchEcontJson(
    '/Nomenclatures/NomenclaturesService.getCities.json',
    {
      countryCode: 'BGR',
    }
  );

  const cities = Array.isArray(citiesResponse?.cities)
    ? citiesResponse.cities
    : [];

  const normalizedInput = normalizeText(cleanCity);

  const exactMatch =
    cities.find((city) => normalizeText(city?.name) === normalizedInput) ||
    cities.find((city) => normalizeText(city?.nameEn) === normalizedInput);

  if (exactMatch?.id) {
    return exactMatch.id;
  }

  const containsMatch =
    cities.find((city) => normalizeText(city?.name).includes(normalizedInput)) ||
    cities.find((city) => normalizeText(city?.nameEn).includes(normalizedInput));

  if (containsMatch?.id) {
    return containsMatch.id;
  }

  throw new DeliveryError(`Не е намерен град "${cleanCity}" в Еконт.`, 404);
}

export async function getEcontOfficesByCityName(cityName) {
  const cityId = await getEcontCityIdByName(cityName);

  const officesResponse = await fetchEcontJson(
    '/Nomenclatures/NomenclaturesService.getOffices.json',
    {
      countryCode: 'BGR',
      cityID: Number(cityId),
    }
  );

  const offices = Array.isArray(officesResponse?.offices)
    ? officesResponse.offices
    : [];

  return offices
    .map((office) => {
      const officeName = sanitizeText(office?.name || office?.nameEn || '');
      const officeCode = sanitizeText(office?.code || '');
      const officeId = office?.id ?? officeCode ?? officeName;

      const city =
        sanitizeText(office?.address?.city?.name) ||
        sanitizeText(office?.address?.city?.nameEn) ||
        sanitizeText(cityName);

      const address =
        sanitizeText(office?.address?.fullAddress) ||
        sanitizeText(office?.address?.fullAddressEn) ||
        [
          sanitizeText(office?.address?.street),
          sanitizeText(office?.address?.num),
          sanitizeText(office?.address?.other),
        ]
          .filter(Boolean)
          .join(', ');

      if (!officeName) {
        return null;
      }

      return buildOfficeLabel({
        carrier: 'Еконт',
        officeId,
        officeCode,
        officeName,
        cityName: city,
        address,
      });
    })
    .filter(Boolean);
}

/* -----------------------------
   SPEEDY
----------------------------- */

async function fetchSpeedy(endpoint, body = {}) {
  const userName = requireEnv('SPEEDY_USERNAME');
  const password = requireEnv('SPEEDY_PASSWORD');

  const payload = {
    userName,
    password,
    language: 'BG',
    ...body,
  };

  const response = await fetch(`${SPEEDY_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new DeliveryError(
      data?.error?.message ||
        data?.message ||
        'Speedy API върна неуспешен отговор.',
      response.status
    );
  }

  if (data?.error) {
    throw new DeliveryError(
      data.error?.message || 'Speedy API върна грешка.',
      400
    );
  }

  return data;
}

async function getSpeedySiteIdsByCityName(cityName) {
  const cleanCity = sanitizeText(cityName);

  if (!cleanCity) {
    throw new DeliveryError('Липсва град за търсене в Спиди.', 400);
  }

  const response = await fetchSpeedy('/location/site', {
    countryId: 100,
    name: cleanCity,
  });

  const sites = Array.isArray(response?.sites) ? response.sites : [];
  const normalizedInput = normalizeText(cleanCity);

  const exactMatches = sites.filter(
    (site) =>
      normalizeText(site?.name) === normalizedInput ||
      normalizeText(site?.nameEn) === normalizedInput
  );

  const fallbackMatches = sites.filter(
    (site) =>
      normalizeText(site?.name).includes(normalizedInput) ||
      normalizeText(site?.nameEn).includes(normalizedInput)
  );

  const pickedSites = exactMatches.length > 0 ? exactMatches : fallbackMatches;

  const siteIds = dedupeByValue(
    pickedSites.map((site) => Number(site?.id)).filter(Number.isFinite)
  );

  if (siteIds.length === 0) {
    throw new DeliveryError(`Не е намерен град "${cleanCity}" в Спиди.`, 404);
  }

  return siteIds;
}

export async function getSpeedyOfficesByCityName(cityName) {
  const siteIds = await getSpeedySiteIdsByCityName(cityName);

  const allOffices = [];

  for (const siteId of siteIds) {
    const response = await fetchSpeedy('/location/office', {
      countryId: 100,
      siteId,
    });

    const offices = Array.isArray(response?.offices) ? response.offices : [];
    allOffices.push(...offices);
  }

  const mapped = allOffices
    .map((office) => {
      const officeName = sanitizeText(office?.name || office?.nameEn || '');
      const officeCode = sanitizeText(office?.code || '');
      const officeId = office?.id ?? officeCode ?? officeName;

      const city =
        sanitizeText(office?.address?.siteAddress?.siteName) ||
        sanitizeText(office?.address?.siteAddress?.siteNameEn) ||
        sanitizeText(office?.site?.name) ||
        sanitizeText(cityName);

      const address =
        sanitizeText(office?.address?.fullAddressString) ||
        sanitizeText(office?.address?.fullAddress) ||
        sanitizeText(office?.address?.note) ||
        '';

      if (!officeName) {
        return null;
      }

      return buildOfficeLabel({
        carrier: 'Спиди',
        officeId,
        officeCode,
        officeName,
        cityName: city,
        address,
      });
    })
    .filter(Boolean);

  const uniqueMap = new Map();

  for (const office of mapped) {
    const key = office.code || office.id || office.label;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, office);
    }
  }

  return Array.from(uniqueMap.values());
}