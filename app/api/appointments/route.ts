
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all appointments for a User (Patient, Doctor, or Hospital Admin)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId'); 
  const role = searchParams.get('role'); // INDIVIDUAL, DOCTOR, HOSPITAL_ADMIN

  if (!userId || !role) return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });

  try {
    let whereClause = {};

    if (role === 'INDIVIDUAL') {
      whereClause = { individualId: userId };
    } else if (role === 'DOCTOR') {
      whereClause = { doctorId: userId };
    } else if (role === 'HOSPITAL_ADMIN') {
      // Find hospital first
      const admin = await prisma.user.findUnique({
        where: { id: userId },
        select: { hospitalProfile: { select: { id: true } } }
      });
      if (admin?.hospitalProfile?.id) {
        whereClause = { hospitalId: admin.hospitalProfile.id };
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        individual: { select: { firstName: true, lastName: true } },
        doctor: { select: { firstName: true, lastName: true, specialization: true } },
        hospital: { select: { name: true, address: true } }
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json(appointments);

  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// CREATE a new Appointment (Booking)
export async function POST(request: Request) {
  try {
    const { individualId, hospitalId, doctorId, date, reason, voiceNoteUrl } = await request.json();

    const newAppointment = await prisma.appointment.create({
      data: {
        individualId,
        hospitalId,
        doctorId, // optional
        date: new Date(date),
        reason,
        voiceNoteUrl, // Store link if recorded
        status: 'PENDING'
      }
    });

    return NextResponse.json(newAppointment);

  } catch (error: any) {
    console.error('Booking Error:', error);
    return NextResponse.json({ error: 'Booking failed.' + error.message }, { status: 500 });
  }
}

// UPDATE Status (Hospital confirms/cancels)
export async function PATCH(request: Request) {
  try {
    const { id, status, notes } = await request.json(); // id is appointment ID

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        notes
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
