import { LoginResponseType } from "@/types/login.type";
import { APP_CONSTANTS } from "../../constants/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";


/**
 * Local storage service
 */

export function set(key: string, value: string) {
  try {
    AsyncStorage.setItem(key, value);
  } catch {
    console.warn("Error reading from local storage");
  }
}

export function get(key: string) {
  try {
    const item = AsyncStorage.getItem(key);
    return item;
  } catch {
    return null;
  }
}

export const LocalStorage = {
  getAppLang: () => {
    const appLang = get(APP_CONSTANTS.STORAGE_KEY.APPLICATION_LANGUAGE);
    return {
      appLang: appLang,
    };
  },

  storeLoginData: (loginDetails:LoginResponseType) => {
    set(
      APP_CONSTANTS.STORAGE_KEY.CURRENT_USER,
      JSON.stringify(loginDetails.data.user)
    );
    set(APP_CONSTANTS.STORAGE_KEY.ACCESS_TOKEN, loginDetails.data.token);
  },

  removeLoginData: () => {
    // localStorage.removeItem(APP_CONSTANTS.STORAGE_KEY.CURRENT_USER);
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEY.ACCESS_TOKEN);
    // localStorage.removeItem(APP_CONSTANTS.STORAGE_KEY.USER_ROLE);
  },
};
