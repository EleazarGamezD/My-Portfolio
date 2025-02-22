export interface ISendEmail {
  subject: string;
  name: string;
  contactEmail: string;
  message: string;
}

export interface IEmailApiRes {
  data: EmailData;
  dataTO: EmailData;
}

export interface EmailData {
  accepted: string[];
  rejected: string[];
  ehlo: string[];
  envelopeTime: number;
  messageTime: number;
  messageSize: number;
  response: string;
  envelope: Envelope;
  messageId: string;
}

export interface Envelope {
  from: string;
  to: string[];
}
