export interface GrantedApplication {
  id: string;
  clientName: string;
  clientId: string;
  scopes: string[];
  issuedAt: any;
  expireAt: any;
  encodedValue: string;
  place: number;
}
