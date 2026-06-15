import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';
import { environment } from '../../../../environments/environment';

export interface TranslatePayload {
  text: string;
  from?: string;
  to?: string;
}

export interface TranslateResponse {
  translated: string;
}

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
