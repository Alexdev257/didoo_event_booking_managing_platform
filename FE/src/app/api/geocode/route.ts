import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing lat or lng parameter" },
      { status: 400 }
    );
  }

  try {
    // Use Nominatim (OpenStreetMap) for reverse geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&language=vi`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "DidooApp/1.0",
      },
    });

    if (!response.ok) {
      throw new Error("Nominatim API error");
    }

    const data = await response.json();

    if (!data.address) {
      return NextResponse.json(
        { error: "No address found" },
        { status: 404 }
      );
    }

    const address = data.address;

    // Build full address
    const parts: string[] = [];
    if (address.house_number) parts.push(address.house_number);
    if (address.road) parts.push(address.road);
    if (address.village || address.town || address.municipality) {
      parts.push(address.village || address.town || address.municipality);
    }
    if (address.county) parts.push(address.county);
    if (address.city || address.state) parts.push(address.city || address.state);

    const fullAddress = parts.join(", ");

    return NextResponse.json({
      address: fullAddress,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      province: address.city || address.state || "",
      district: address.county || "",
      ward: address.village || address.town || address.municipality || "",
      postcode: address.postcode || "",
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to reverse geocode" },
      { status: 500 }
    );
  }
}
