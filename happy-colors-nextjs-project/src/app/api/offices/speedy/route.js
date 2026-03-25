import { NextResponse } from 'next/server';

function getApiBaseUrl() {
  return String(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030').replace(/\/+$/, '');
}

export async function GET(request) {
  try {
    const city = String(request.nextUrl.searchParams.get('city') || '').trim();

    if (!city) {
      return NextResponse.json({ offices: [] }, { status: 200 });
    }

    const apiBaseUrl = getApiBaseUrl();
    const targetUrl = `${apiBaseUrl}/delivery/speedy/offices?city=${encodeURIComponent(city)}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data?.message || 'Грешка при зареждане на офисите на Спиди.',
          offices: [],
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        offices: Array.isArray(data?.offices) ? data.offices : [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Speedy proxy route error:', error);

    return NextResponse.json(
      {
        message: 'Грешка при зареждане на офисите на Спиди.',
        offices: [],
      },
      { status: 500 }
    );
  }
}