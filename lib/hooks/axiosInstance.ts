import axios, { AxiosResponse } from "axios";
// import { LocalStorage } from "../../storage/LocalStorage";

export const InternalServerError = {
  message: "Internal error occurred during the request.",
  code: -500,
};

export const onFulfilledRequest = (response: AxiosResponse) => response;

export const onRejectedRequest = (_error: any) =>
  Promise.reject(InternalServerError);

export const publicApiRequest = (url?: string) => {
  return axios.create({
    baseURL:
      url !== undefined && url.length > 0
        ? url
        : "https://jsonplaceholder.typicode.com/posts",
  });
};

publicApiRequest().interceptors.response.use(
  onFulfilledRequest,
  onRejectedRequest
);
