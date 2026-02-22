
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

    // 1. Create Base User
    const user = await prisma.user.create({
      data: {
      email,
      password: hashedPassword,
      role,
      },
    });

    // 2. Create Specific Profile based on Role
    try {
      if (role === 'INDIVIDUAL') {
      const { firstName, lastName, phone } = profileData;
      await prisma.individualProfile.create({
        data: {
        userId: user.id,
        firstName,
        lastName,
        phoneNumber: phone || null,
        },
      });
      } else if (role === 'HOSPITAL_ADMIN') {
      const { hospitalName, regNumber, phone } = profileData;
      await prisma.hospitalProfile.create({
        data: {
        userId: user.id,
        name: hospitalName,
        registrationNumber: regNumber,
        contactPhone: phone || null,
        },
      });
      }
    } catch (profileError) {
      // If profile creation fails, we might want to delete the user to keep data consistent (manual rollback)
      await prisma.user.delete({ where: { id: user.id } });
      throw profileError;
    }

    const { password: _, ...userData } = user;

    return NextResponse.json({ success: true, user: userData, role });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
