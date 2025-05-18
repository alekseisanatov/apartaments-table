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

    console.log("Starting to scrape apartments...");
    const apartments = await scrapeBonavaApartments();
    console.log(`Scraped ${apartments.length} apartments`);

    if (!apartments || apartments.length === 0) {
      return NextResponse.json(
        { error: "No apartments were scraped" },
        { status: 400 }
      );
    }

    console.log("Clearing existing apartments...");
    // Clear existing apartments
    await prisma.apartment.deleteMany();

    console.log("Inserting new apartments...");
    // Insert new apartments
    const createdApartments = await prisma.apartment.createMany({
      data: apartments,
    });

    console.log(`Successfully created ${createdApartments.count} apartments`);
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
