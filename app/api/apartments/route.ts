import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { scrapeBonavaApartments } from "../../../utils/scraper";

// Create a single PrismaClient instance
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();

    const apartments = await prisma.apartment.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(apartments);
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST() {
  try {
    // Test database connection
    await prisma.$connect();

    const apartments = await scrapeBonavaApartments();

    // Clear existing apartments
    await prisma.apartment.deleteMany();

    // Insert new apartments
    const createdApartments = await prisma.apartment.createMany({
      data: apartments,
    });

    return NextResponse.json({
      message: "Apartments updated successfully",
      count: createdApartments.count,
    });
  } catch (error) {
    console.error("Error updating apartments:", error);
    return NextResponse.json(
      {
        error: "Failed to update apartments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
