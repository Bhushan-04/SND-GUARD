import { createSndGuardClient } from '@snd-guard/shared';
import { API_URL } from './utils';

export const sndGuard = createSndGuardClient(API_URL);
