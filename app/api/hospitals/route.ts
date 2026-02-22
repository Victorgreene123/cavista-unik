
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all available hospitals for searching
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q'); // Text search (name or specialty)
  
  try {
    const hospitals = await prisma.hospitalProfile.findMany({
      where: query ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { specialization: { contains: query, mode: 'insensitive' } }, // Assuming simplified model for specialties
          { 
            doctors: {
              some: {
                specialization: { contains: query, mode: 'insensitive' } 
              }
            }
          }
        ]
      } : undefined,
      select: {
        id: true,
        name: true,
        address: true,
        // Include summary data needed for cards
        doctors: {
          take: 3, 
          select: { firstName: true, specialization: true } 
        }
      }
    });

    return NextResponse.json(hospitals);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch hospitals' }, { status: 500 });
  }
}
