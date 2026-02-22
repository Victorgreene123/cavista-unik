
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all scans for an Individual
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const individualId = searchParams.get('userId'); 

  if (!individualId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  try {
    const scans = await prisma.healthScan.findMany({
      where: { individualId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(scans);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// SAVE a new Health Scan (Result of "Analyse" Feature)
export async function POST(request: Request) {
  try {
    const { individualId, heartRate, oxygenSaturation, stressLevel, overallScore, aiAnalysis } = await request.json();

    const scan = await prisma.healthScan.create({
      data: {
        individualId,
        heartRate,        // Int
        oxygenSaturation, // Int
        stressLevel,      // String ("Low", "High")
        overallScore,     // Int (0-100)
        aiAnalysis,       // Text Summary
      }
    });

    return NextResponse.json(scan);

  } catch (error: any) {
    console.error('Save Scan Error:', error);
    return NextResponse.json({ error: 'Failed to save scan' }, { status: 500 });
  }
}
