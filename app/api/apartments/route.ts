import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { scrapeBonavaApartments } from "../../../utils/scraper";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const apartments = await prisma.apartment.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(apartments);
  } catch (error) {
    console.error("Error fetching apartments:", error);
    return NextResponse.json(
      { error: "Failed to fetch apartments" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
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
      { error: "Failed to update apartments" },
      { status: 500 }
    );
  }
}
