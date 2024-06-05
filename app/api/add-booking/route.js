import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const email = searchParams.get('email');
  const description = searchParams.get('description');
  const start_date = searchParams.get('start_date');
  const end_date = searchParams.get('end_date');

 
  try {
    if (!name || !email || !start_date || !end_date) throw new Error('Name, email, start date, and end date required');
    await sql`INSERT INTO Bookings (name, email, description, start_date, end_date) VALUES (${name}, ${email}, ${description}, ${start_date}, ${end_date});`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
 
  const Bookings = await sql`SELECT * FROM Bookings;`;
  return NextResponse.json({ Bookings }, { status: 200 });
}