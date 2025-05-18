import axios from "axios";

export interface ApartmentData {
  price: number;
  sqMeters: number;
  plan: string;
  projectName: string;
  roomsCount: number;
  imageUrl: string;
  floor: number;
  link: string;
  status: string;
  tag: string;
  projectLink: string;
}

interface ApiApartment {
  projectName: string;
  price: string | number;
  sqMeters: string | number;
  plan: string;
  roomsCount: string | number;
  imageUrl: string;
  floor: string | number;
  link: string;
  status: string;
  tags: string[];
  projectLink: string;
}

export async function scrapeBonavaApartments(): Promise<ApartmentData[]> {
  try {
    const response = await axios.get<ApiApartment[]>(
      "https://www.bonava.lv/api/apartments"
    );
    const data = response.data;

    if (!Array.isArray(data)) {
      throw new Error("Invalid data format received from API");
    }

    return data.map((apt: ApiApartment) => ({
      projectName: apt.projectName || "",
      price: parseFloat(String(apt.price)) || 0,
      sqMeters: parseFloat(String(apt.sqMeters)) || 0,
      plan: apt.plan || "",
      roomsCount: parseInt(String(apt.roomsCount)) || 0,
      imageUrl: apt.imageUrl || "",
      floor: parseInt(String(apt.floor)) || 0,
      link: apt.link || "",
      status: apt.status || "",
      tag: JSON.stringify(apt.tags || []),
      projectLink: apt.projectLink || "",
    }));
  } catch (error) {
    console.error("Error scraping apartments:", error);
    throw error;
  }
}
