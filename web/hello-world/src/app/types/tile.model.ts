export interface Tile {
  id: string | undefined;
  name: string;
  description: string;
  target: string;
  enabled: boolean;
  code_frontend: string;
  code_backend: string | undefined;
}
