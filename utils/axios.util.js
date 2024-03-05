import axios from "axios";
import getLogger from "../logger/index.js";

const logger = getLogger("thinkifichttp");
const thinkificAxios = axios.create({});

// Add a request interceptor
thinkificAxios.interceptors.request.use(
  function (request) {
    const headers = {
      "X-Auth-API-Key": process.env.THINKIFIC_ADMIN_API_AUTH_KEY,
      "X-Auth-Subdomain": process.env.THINKIFIC_ADMIN_API_AUTH_SUBDOMAIN,
      "Content-Type": "application/json",
    };
    // Do something before request is sent
    if (request.url.slice(0, 4) !== "http") {
      request.url = process.env.THINKIFIC_ADMIN_API_URL + request.url;
    }
    request.headers = { ...request.headers, ...headers };
    logger.addContext("req", request);
    logger.info(
      "API Request: ",
      JSON.stringify({
        url: request.url,
        method: request.method,
        data: request.data,
        body: request.body,
        json: request.json,
      }),
    );
    return request;
  },
  function (error) {
    // Do something with request error
    logger.error(error);
    return Promise.reject(error);
  },
);

// Add a response interceptor
thinkificAxios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    const { request, config, method, path, ...rest } = response;
    const { status, statusText, data } = rest;
    logger.addContext("res", response);
    logger.info("API Response: ", JSON.stringify({ status, statusText, method, path, data }));
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    logger.error("API Error: ", error.response);
    if (!error.response) {
      // network error
      logger.info({ "Network Error": "Internet connectivity is lost. Please check your network connection." });
      return [];
    }

    const code = parseInt(error.response && error.response.status);
    if (code !== 404 && code !== 500) {
      logger.error({ "Err Response": error.response });
      var MSG = error.response.data.message || "Something went wrong!";
    }
    switch (code) {
      case 400:
      case 401:
      case 422:
        break;
      case 404:
        MSG = "Resource does not exist";
        break;
      case 500:
        MSG = "Server is not responding at the moment. Please try again later.";
        break;
      default:
        MSG = "Server is not responding at the moment. Please try again later.";
        break;
    }
    logger.error({ Error: MSG });
    return error.response;
  },
);

export default thinkificAxios;
