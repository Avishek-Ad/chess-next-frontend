"use server";

import { cookies } from "next/headers";

export async function handleRefresh() {
  // console.log("handle refresh");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SELF_URL}/api/refresh`,
    { method: "POST" }
  );
  let responseData = null;
  try {
    responseData = await response.json();
  } catch (e) {
    console.error("Failed to parse JSON from /api/refresh:", e);
    return null; // refresh failed
  }
  if (responseData.access) {
    return responseData.access;
  } else {
    return null;
  }
}

export async function handleLogin(
  userId: string,
  accessToken: string,
  refreshToken: string
) {
  const cookieStore = await cookies();

  cookieStore.set("session_userid", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // one week,
    path: "/",
  });

  cookieStore.set("session_access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60, // one hour,
    path: "/",
  });

  cookieStore.set("session_refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // one week,
    path: "/",
  });
}

export async function resetAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.set("session_userid", "");
  cookieStore.set("session_access_token", "");
  cookieStore.set("session_refresh_token", "");
}

export async function setAccessCookie(accessToken: string) {
  const cookieStore = await cookies();
  cookieStore.set("session_access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60, // one hour,
    path: "/",
  });
}

export async function getUserid() {
  const cookieStore = await cookies();

  const userid = cookieStore.get("session_userid")?.value;
  return userid ? userid : null;
}

export async function getAccessToken() {
  const cookieStore = await cookies();

  let accessToken = cookieStore.get("session_access_token")?.value;
  if (!accessToken) {
    accessToken = await handleRefresh();
  }
  return accessToken ? accessToken : null;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();

  const refreshToken = cookieStore.get("session_refresh_token")?.value;
  return refreshToken ? refreshToken : null;
}
