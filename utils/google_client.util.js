import { OAuth2Client } from "google-auth-library";

let googleClient = null;

function getGoogleClient() {
  if (!googleClient) googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  return googleClient;
}

export default getGoogleClient;
