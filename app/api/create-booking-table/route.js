import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(request) {
  try {
    const result =
    // Create a table called Bookings with the following columns:
    //start date, end date, email, name, description

      await sql`
        CREATE TABLE Bookings (
        start_date DATE,
        end_date DATE,
        email VARCHAR(255),
        name VARCHAR(255),
        description TEXT
        );`;
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}