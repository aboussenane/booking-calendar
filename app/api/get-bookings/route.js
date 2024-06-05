
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const result = await sql`SELECT  * FROM Bookings;`;
    console.log('Full result:', result); // Log the full result
    console.log('Fetched rows:', result.rows); // Log the rows specifically
    const bookings = result.rows;
    const response = NextResponse.json({ bookings }, { status: 200 });

    // Set cache-control headers to disable caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}