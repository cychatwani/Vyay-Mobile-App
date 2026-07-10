// import { signUpWithGoogle } from "react-native-credentials-manager";

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Keys } from "../../../config/Keys";
import { apiPost } from "../../../utils/ApiHelper";
import { Method } from "../../../constants/Method";
/**
 * Type definition for the Google Sign-In response.
 */
export interface GoogleUserResponse {
  data: {
    idToken: string;
    scopes: string[];
    serverAuthCode: string | null;
    user: {
      email: string;
      familyName: string;
      givenName: string;
      id: string;
      name: string;
      photo: string;
    };
  };
  type: string;
}
/**
 * A minimal representation of extracted Google user information.
 */
export interface GoogleUserInfo {
  idToken: string | null;
  email: string | null;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  photo: string | null;
  userId: string | null;
}
/**
 * Extracts relevant user information from a Google Sign-In response.
 *
 * @param response - The raw response object returned from Google Sign-In.
 * @returns A simplified object containing only the relevant fields:
 *          - idToken
 *          - email
 *          - name
 *          - givenName
 *          - familyName
 *          - photo
 *          - userId
 *
 * @example
 * const response: GoogleUserResponse = {
 *   data: {
 *     idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
 *     scopes: ["email", "profile"],
 *     serverAuthCode: null,
 *     user: {
 *       email: "cyc4404@gmail.com",
 *       familyName: "Chatwani",
 *       givenName: "Chirag",
 *       id: "100925876451525269770",
 *       name: "Chirag Chatwani",
 *       photo: "https://lh3.googleusercontent.com/a/ACg8ocJxkVmhe..."
 *     }
 *   },
 *   type: "success"
 * };
 *
 * const userInfo = extractGoogleUserInfo(response);
 * console.log(userInfo.email); // "cyc4404@gmail.com"
 */
export function extractGoogleUserInfo(response: GoogleUserResponse): GoogleUserInfo {
  if (!response || !response.data) {
    return {
      idToken: null,
      email: null,
      name: null,
      givenName: null,
      familyName: null,
      photo: null,
      userId: null,
    };
  }

  const { idToken, user } = response.data;

  return {
    idToken: idToken || null,
    email: user?.email || null,
    name: user?.name || null,
    givenName: user?.givenName || null,
    familyName: user?.familyName || null,
    photo: user?.photo || null,
    userId: user?.id || null,
  };
}
export const AndroidOnPressSignInwithGoogle = async () => {
  try {
    GoogleSignin.configure({
      webClientId:
        Keys.google.clientId, // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
    });
    await GoogleSignin.signOut(); 
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    const hasPreviousSignIn = GoogleSignin.hasPreviousSignIn();
    await SignInWithGoogleIdToken(response.data.idToken);
    // const googleCredential = await signUpWithGoogle({
    //     serverClientId: "79365214496-c026mqlrgipsho5cek4sbkve2i3e93no.apps.googleusercontent.com",
    //     autoSelectEnabled: false,
    //   });
    // console.log("Hello " , JSON.stringify(googleCredential))
  } catch (error) {
    console.log("Samasya ", error);
  }
};

