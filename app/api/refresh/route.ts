import { resetAuthCookies, setAccessCookie } from "@/app/lib/actions";
import apiService from "@/app/services/apiService";
import { NextResponse } from "next/server";

export async function POST() {
  const response = await apiService.refresh("/api/token/refresh");

  console.log("inside local server post method", response)

  if (response.access) {
    await setAccessCookie(response.access);
    return NextResponse.json({ access: response.access });
  }

  // Refresh failed → logout
  await resetAuthCookies();
  return NextResponse.json({ access: null });
}
