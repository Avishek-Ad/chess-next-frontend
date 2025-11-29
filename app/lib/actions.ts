"use server";

import { cookies } from "next/headers";

export async function handleRefresh() {
  console.log("handle refresh");
  const cookieStore = await cookies();

  const refreshToken = await getRefreshToken();

  const token = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/token/refresh/`, {
    method: "POST",
    body: JSON.stringify({
      refresh: refreshToken,
    }),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((json) => {
      console.log("Response - refresh:", json);
      if (json.access) {
        cookieStore.set("session_access_token", json.access, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60, // one hour,
          path: "/",
        });
        return json.access;
      } else {
        resetAuthCookies();
      }
    })
    .catch((error) => {
      console.log("error", error);
    });
  return token;
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
    maxAge: 24* 60 * 60, // one day,
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