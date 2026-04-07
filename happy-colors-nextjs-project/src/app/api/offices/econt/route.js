import { NextResponse } from 'next/server';
import baseURL from '@/config';

export async function GET(request) {
  try {
    const city = String(request.nextUrl.searchParams.get('city') || '').trim();

    if (!city) {
      return NextResponse.json({ offices: [] }, { status: 200 });
    }

    const targetUrl = `${baseURL}/delivery/econt/offices?city=${encodeURIComponent(city)}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data?.message || 'Грешка при зареждане на офисите на Еконт.',
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
    console.error('Econt proxy route error:', error);

    return NextResponse.json(
      {
        message: 'Грешка при зареждане на офисите на Еконт.',
        offices: [],
      },
      { status: 500 }
    );
  }
}
