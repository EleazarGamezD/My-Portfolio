import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { IRecaptchaVerifyResponse } from '@core/interfaces/recaptcha/recaptchat.interface';
import { API_RECAPTCHA_ROUTES } from '@core/routes/recaptcha/recaptcha.routes';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';

@Injectable({
  providedIn: 'root',
})
export class RecaptchaService extends GlobalHttpService {
  async verifyToken(token: string): Promise<IRecaptchaVerifyResponse> {
    return await this.makeHttpRequest<IRecaptchaVerifyResponse>(
      API_RECAPTCHA_ROUTES.checkRecaptcha,
      { token },
      RequestMethod.POST,
    );
  }
}
