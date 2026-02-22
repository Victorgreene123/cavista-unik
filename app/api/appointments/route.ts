
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all appointments for a User (Patient, Doctor, or Hospital Admin)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId"); 
  const role = searchParams.get("role"); // INDIVIDUAL, DOCTOR, HOSPITAL_ADMIN

  if (!userId || !role) return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });

  try {
    let whereClause: any = {};

    if (role === "INDIVIDUAL") {
      const profile = await prisma.individualProfile.findUnique({ where: { userId } });
      if (profile) whereClause.individualId = profile.id; 
      else return NextResponse.json({ error: "Individual profile not found" }, { status: 404 });

    } else if (role === "DOCTOR") {
      const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
      if (profile) whereClause.doctorId = profile.id;
      else return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });

    } else if (role === "HOSPITAL_ADMIN") {
      const profile = await prisma.hospitalProfile.findUnique({ where: { userId } });
      if (profile) whereClause.hospitalId = profile.id; 
      else return NextResponse.json({ error: "Hospital profile not found" }, { status: 404 });
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        individual: { select: { firstName: true, lastName: true, phoneNumber: true } },
        doctor: { select: { firstName: true, lastName: true, specialization: true } },
        hospital: { select: { name: true, address: true } }
      },
      orderBy: { date: "asc" }
    });

    return NextResponse.json(appointments);

  } catch (error: any) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// CREATE a new Appointment (Booking)
export async function POST(request: Request) {
  try {
    const { userId, hospitalId, doctorId, date, reason, voiceNoteUrl } = await request.json();

    // Check if user is an Individual
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { individualProfile: true }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Must be an Individual to book
    // If they are an Individual Role but no profile, creating one might be needed (edge case)
    // But for now, we expect profile to exist.
    
    let individualProfileId = user.individualProfile?.id;

    if (!individualProfileId) {
        // If user is INDIVIDUAL but profile missing, create it?
        // Or if user is another role trying to book for themselves? 
        // For now, strict check:
        return NextResponse.json({ error: "Individual profile not found. Please ensure you are registered as a Patient." }, { status: 404 });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        individualId: individualProfileId,
        hospitalId,
        doctorId, // optional
        date: new Date(date),
        reason,
        voiceNoteUrl, 
        status: "PENDING"
      }
    });

    return NextResponse.json(newAppointment);

  } catch (error: any) {
    console.error("Booking Error:", error);
    return NextResponse.json({ error: "Booking failed: " + error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();
        
        const updated = await prisma.appointment.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

