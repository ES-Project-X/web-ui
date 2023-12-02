export const API_KEY = process.env.PUBLIC_KEY_HERE;
export const URL_API = process.env.DATABASE_API_URL;
export const URL_GEO = "https://geocode.search.hereapi.com/v1/geocode?apiKey=" + API_KEY + "&in=countryCode:PRT";
export const URL_REV = "https://revgeocode.search.hereapi.com/v1/revgeocode?apiKey=" + API_KEY;
export const URL_ROUTING = process.env.URL_ROUTING;
export const COGNITO_LOGIN_URL = process.env.COGNITO_LOGIN_URL;