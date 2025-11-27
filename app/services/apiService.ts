import { getAccessToken } from "../lib/actions";

const getHeaders = async () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  const accessToken = await getAccessToken();
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
};

const apiService = {
  get: async function (url: string): Promise<any> {
    // console.log("get", url);

    const headers = await getHeaders();

    return new Promise((resolve, reject) => {
      fetch(`${process.env.NEXT_PUBLIC_API_HOST}${url}`, {
        method: "GET",
        headers: headers,
      })
        .then((response) => response.json())
        .then((json) => {
          // console.log("Response: ", json);
          resolve(json);
        })
        .catch((error) => reject(error));
    });
  },

  post: async function (url: string, data: any): Promise<any> {
    // console.log("post", url, data);

    const headers = await getHeaders();

    return new Promise((resolve, reject) => {
      fetch(`${process.env.NEXT_PUBLIC_API_HOST}${url}`, {
        method: "POST",
        headers: headers,
        body: data,
      })
        .then((response) => response.json())
        .then((json) => {
          // console.log("Response: ", json);
          resolve(json);
        })
        .catch((error) => {
          
          reject(error)});
    });
  },

  postwithoutdata: async function (url: string): Promise<any> {
    // console.log("post", url);

    const headers = await getHeaders();

    return new Promise((resolve, reject) => {
      fetch(`${process.env.NEXT_PUBLIC_API_HOST}${url}`, {
        method: "POST",
        headers: headers,
      })
        .then((response) => response.json())
        .then((json) => {
          // console.log("Response: ", json);
          resolve(json);
        })
        .catch((error) => reject(error));
    });
  },
};

export default apiService;
