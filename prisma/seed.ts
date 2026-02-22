import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function main() {
  console.log(' Starting seed...');

  // 1. Clean up existing data
  try {
    await prisma.appointment.deleteMany();
    await prisma.healthScan.deleteMany();
    await prisma.medicalReport.deleteMany();
    await prisma.doctorProfile.deleteMany();
    await prisma.hospitalProfile.deleteMany();
    await prisma.individualProfile.deleteMany();
    await prisma.user.deleteMany();
    console.log(' Cleaned up database');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn('  Could not clean up database (maybe it was empty or new tables?):', msg);
  }

  // 2. Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // --- Hospital Admin ---
  const hospitalUser = await prisma.user.create({
    data: {
      email: 'hospital@test.com',
      password: hashedPassword,
      role: UserRole.HOSPITAL_ADMIN,
      hospitalProfile: {
        create: {
          name: 'City General Hospital',
          registrationNumber: 'HOSP-001',
          address: '123 Medical Drive, Health City',
          contactEmail: 'contact@citygeneral.com',
          contactPhone: '+1-555-0123',
        },
      },
    },
    include: {
      hospitalProfile: true,
    },
  });
  console.log("Created Hospital: ");

  // --- Doctor (linked to Hospital) ---
  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@test.com',
      password: hashedPassword,
      role: UserRole.DOCTOR,
      doctorProfile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Connor',
          specialization: 'Cardiologist',
          licenseNumber: 'DOC-999',
          hospitalId: hospitalUser.hospitalProfile!.id,
        },
      },
    },
    include: {
      doctorProfile: true,
    },
  });
  console.log(" Created Doctor: ");

  // --- Individual (Patient) ---
  const individualUser = await prisma.user.create({
    data: {
      email: 'patient@test.com',
      password: hashedPassword,
      role: UserRole.INDIVIDUAL,
      individualProfile: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'Male',
          phoneNumber: '+1-555-9876',
          address: '456 Elm Street, Suburbia',
          bloodGroup: 'O+',
          genotype: 'AA',
          allergies: 'Peanuts, Penicillin',
        },
      },
    },
    include: {
      individualProfile: true,
    },
  });
  console.log("Created Patient:");

  // 3. Create Related Data

  // --- Appointments ---
  await prisma.appointment.create({
    data: {
      individualId: individualUser.individualProfile!.id,
      hospitalId: hospitalUser.hospitalProfile!.id,
      doctorId: doctorUser.doctorProfile!.id,
      date: new Date(new Date().setDate(new Date().getDate() - 5)), 
      reason: 'Regular Checkup',
      status: AppointmentStatus.COMPLETED,
      notes: 'Patient is healthy. BP normal.',
    },
  });

  await prisma.appointment.create({
    data: {
      individualId: individualUser.individualProfile!.id,
      hospitalId: hospitalUser.hospitalProfile!.id,
      // No specific doctor
      date: new Date(new Date().setDate(new Date().getDate() + 2)), 
      reason: 'Persistent Headache',
      status: AppointmentStatus.CONFIRMED,
    },
  });

  await prisma.appointment.create({
    data: {
      individualId: individualUser.individualProfile!.id,
      hospitalId: hospitalUser.hospitalProfile!.id,
      date: new Date(new Date().setDate(new Date().getDate() + 10)), 
      reason: 'General Consultation',
      status: AppointmentStatus.PENDING,
    },
  });
  console.log(' Created Appointments');

  // --- Health Scans ---
  await prisma.healthScan.create({
    data: {
      individualId: individualUser.individualProfile!.id,
      heartRate: 72,
      oxygenSaturation: 98,
      respirationRate: 16,
      stressLevel: 'Low',
      temperature: 36.6,
      overallScore: 95,
      aiAnalysis: 'Vital signs appear normal. No immediate concerns detected.',
      createdAt: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
    },
  });
  console.log(' Created Health Scan');

  // --- Medical Reports ---
  await prisma.medicalReport.create({
    data: {
      individualId: individualUser.individualProfile!.id,
      doctorId: doctorUser.doctorProfile!.id,
      title: 'Cardiology Report - Initial Assessment',
      aiAnalysis: 'Patient shows good cardiovascular health. Recommend regular exercise.',
      diagnosis: 'Healthy',
      prescription: 'None',
      createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
    },
  });
  console.log(' Created Medical Report (Seed)');
  
  console.log(' Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
