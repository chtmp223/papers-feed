// extension/source-integration/registry.ts
// Central registry for all source integrations

import { SourceIntegration } from './types';
import { arxivIntegration } from './arxiv';
import { openReviewIntegration } from './openreview';
import { natureIntegration } from './nature';
import { pnasIntegration } from './pnas';
import { aclAnthologyIntegration } from './acl-anthology';
import { ieeeIntegration } from './ieee';
import { nberIntegration } from './nber';
import { newspapersIntegration } from './newspapers';
import { miscIntegration } from './misc';

export const sourceIntegrations: SourceIntegration[] = [
  arxivIntegration,
  openReviewIntegration,
  natureIntegration,
  pnasIntegration,
  aclAnthologyIntegration,
  ieeeIntegration,
  nberIntegration,
  newspapersIntegration,
  miscIntegration, // must be last (catch-all)
];

/*     *     *     *     */

export function getAllIntegrations(): SourceIntegration[] {
  return sourceIntegrations;
}

export function getIntegrationById(id: string): SourceIntegration | undefined {
  return sourceIntegrations.find(integration => integration.id === id);
}

export function getAllContentScriptMatches(): string[] {
  return sourceIntegrations.flatMap(integration => integration.contentScriptMatches);
}
