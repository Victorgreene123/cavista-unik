
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, ...profileData } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User and Profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Base User
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
        },
      });

      // 2. Create Specific Profile based on Role
      if (role === 'INDIVIDUAL') {
        const { firstName, lastName, phone } = profileData;
        await tx.individualProfile.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            phoneNumber: phone || null,
          },
        });
      } else if (role === 'HOSPITAL_ADMIN') {
        const { hospitalName, regNumber, phone } = profileData;
        await tx.hospitalProfile.create({
          data: {
            userId: user.id,
            name: hospitalName,
            registrationNumber: regNumber,
            contactPhone: phone || null,
          },
        });
      }

      return user;
    });

    return NextResponse.json({ success: true, userId: result.id });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
