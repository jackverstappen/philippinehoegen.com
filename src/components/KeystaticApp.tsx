// Thin wrapper so the Astro keystatic page can use a direct import
// (required for client:only — Astro cannot use computed variables there).
import { makePage } from '@keystatic/astro/ui';
import config from '../../keystatic.config';

const KeystaticApp = makePage(config);
export default KeystaticApp;
