import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import {
  TranslatePayload,
  TranslateResponse,
} from '@core/interfaces/translate/translate.interface';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TranslateService extends GlobalHttpService {
  async translate(payload: TranslatePayload): Promise<TranslateResponse> {
    return this.makeRequest<TranslateResponse, TranslatePayload>(
      `${environment.apiUrl}/translate`,
      payload,
      RequestMethod.POST,
    );
  }
}
