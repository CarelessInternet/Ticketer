import type { Client } from '.';

export type Handler = (client: Client) => Promise<void> | void;
