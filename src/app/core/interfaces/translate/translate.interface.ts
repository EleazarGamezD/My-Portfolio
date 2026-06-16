export interface TranslatePayload {
  text: string;
  from?: string;
  to?: string;
}

export interface TranslateResponse {
  translated: string;
}
