
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    // Find User
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        individualProfile: true, // Include profile data if Individual
        hospitalProfile: true,   // Include profile data if Hospital
        doctorProfile: true,     // Include profile data if Doctor
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify Password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Return sanitized User Object (No password!)
    // In a real app, this would set an HttpOnly cookie or return a JWT
    const { password: _, ...userData } = user;

    return NextResponse.json({ 
      success: true, 
      user: userData 
    });

  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
