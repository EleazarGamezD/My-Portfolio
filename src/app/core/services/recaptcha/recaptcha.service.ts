import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { API_RECAPTCHA_ROUTES } from '@core/routes/recaptcha/recaptcha.routes';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';

@Injectable({
  providedIn: 'root',
})
export class RecaptchaService extends GlobalHttpService {
  async verifyToken(token: string): Promise<boolean> {
    return await this.makeHttpRequest<boolean>(
      API_RECAPTCHA_ROUTES.checkRecaptcha,
      { token },
      RequestMethod.POST,
    );
  }
}
