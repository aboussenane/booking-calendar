
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await sql`SELECT * FROM Bookings;`;
    const bookings = result.rows;
    console.log('Fetched bookings:', result); // Log the full result
    console.log('Fetched rows:', result.rows); // Log the rows
    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}