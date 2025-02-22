import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { ISendEmail } from '@core/interfaces/email/email.interface';
import { API_EMAIL_ROUTES } from '@core/routes/email/email.routes';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';

@Injectable({
  providedIn: 'root',
})
export class EmailService extends GlobalHttpService {
  async sendEmail(payload: ISendEmail): Promise<any> {
    return await this.makeHttpRequest<ISendEmail>(
      API_EMAIL_ROUTES.sendEmail,
      { payload },
      RequestMethod.POST,
    );
  }
}
