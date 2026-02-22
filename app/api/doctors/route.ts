
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET list of Doctors (with Search)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q'); // Search name or specialty
  const hospitalId = searchParams.get('hospitalId'); // Filter by hospital
  const id = searchParams.get('id'); // Get specific doctor

  try {
    if (id) {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { id },
        include: {
          hospital: { select: { id: true, name: true, address: true } }
        }
      });
      return NextResponse.json(doctor);
    }
    
    const doctors = await prisma.doctorProfile.findMany({
      where: {
        AND: [
          hospitalId ? { hospitalId } : {},
          q ? {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
              { specialization: { contains: q, mode: 'insensitive' } }
            ]
          } : {}
        ]
      },
      include: {
        hospital: { select: { name: true, address: true } }
      }
    });

    return NextResponse.json(doctors);
  } catch (error: any) {
    return NextResponse.json({ error: 'Docs not found' }, { status: 500 });
  }
}
