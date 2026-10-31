import type { Migration } from '../types';
import { m001 } from './001_initial';

// Add new migrations to the end. Never edit or reorder a migration that has shipped.
export const migrations: Migration[] = [m001];
