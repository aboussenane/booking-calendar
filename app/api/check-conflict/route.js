import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const start_date = searchParams.get('start_date');
  const end_date = searchParams.get('end_date');

  try {
    const result = await sql`
      SELECT * FROM Bookings
      WHERE (start_date < ${end_date} AND end_date > ${start_date} OR start_date = ${start_date} OR end_date = ${end_date});
    `;
    const conflicts = result.rows;
    return NextResponse.json({ conflicts }, { status: 200 });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    return NextResponse.json({ error: 'Failed to check conflicts' }, { status: 500 });
  }
}
