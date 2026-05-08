import { environment } from "../../../../environments/environment";


export const API_RECAPTCHA_ROUTES = {
  checkRecaptcha: `${environment.apiUrl}/contact/verify-captcha`,
};
