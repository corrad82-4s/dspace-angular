export interface GrantedApplication {
  id: string;
  clientName: string;
  clientId: string;
  scopes: string[];
  encodedValue: string;
  place: number;
}
