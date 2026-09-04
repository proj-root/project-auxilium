// Runs as a jest `setupFiles` entry, i.e. before the module registry is
// populated. That ordering matters for anything the specs import which reads
// configuration at module load time.

import { loadTestEnv } from './config';

loadTestEnv();
