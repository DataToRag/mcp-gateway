export interface ConnectedAccount {
  id: string;
  connectorType: string;
  label: string | null;
  accountEmail: string;
  isDefault: boolean;
  createdAt: string;
  scopes: string | null;
  connectedAt: string;
}

export interface LegacyConnection {
  id: string;
  service: string;
  scopes: string | null;
  connectedAt: string;
}
