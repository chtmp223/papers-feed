// extension/source-integration/acl-anthology/index.ts
// ACL Anthology integration with custom metadata extractor

import { BaseSourceIntegration } from '../base-source';
import { MetadataExtractor } from '../metadata-extractor';

class AclAnthologyMetadataExtractor extends MetadataExtractor {
  protected extractTitle(): string {
    return (
      this.getMetaContent('meta[name="citation_title"]') ||
      this.getMetaContent('meta[property="og:title"]') ||
      super.extractTitle()
    );
  }

  protected extractAuthors(): string {
    const authors: string[] = [];
    this.document.querySelectorAll('meta[name="citation_author"]').forEach(el => {
      const content = el.getAttribute('content');
      if (content) authors.push(content);
    });
    if (authors.length > 0) {
      return authors.join(', ');
    }
    return super.extractAuthors();
  }

  protected extractDescription(): string {
    // ACL Anthology uses .acl-abstract for the abstract
    const aclAbstract = this.document.querySelector('.acl-abstract');
    if (aclAbstract) {
      const text = aclAbstract.textContent?.trim();
      if (text) return text;
    }
    return (
      this.getMetaContent('meta[name="citation_abstract"]') ||
      this.getMetaContent('meta[property="og:description"]') ||
      super.extractDescription()
    );
  }

  protected extractPublishedDate(): string {
    return (
      this.getMetaContent('meta[name="citation_publication_date"]') ||
      this.getMetaContent('meta[name="citation_date"]') ||
      super.extractPublishedDate()
    );
  }

  protected extractDoi(): string {
    return this.getMetaContent('meta[name="citation_doi"]') || super.extractDoi();
  }

  protected extractJournalName(): string {
    return (
      this.getMetaContent('meta[name="citation_conference_title"]') ||
      this.getMetaContent('meta[name="citation_journal_title"]') ||
      super.extractJournalName()
    );
  }

  protected extractTags(): string[] {
    const keywords = this.getMetaContent('meta[name="keywords"]');
    if (keywords) {
      return keywords.split(',').map(tag => tag.trim());
    }
    return [];
  }
}

export class AclAnthologyIntegration extends BaseSourceIntegration {
  readonly id = 'acl-anthology';
  readonly name = 'ACL Anthology';

  readonly urlPatterns = [
    /aclanthology\.org\/([A-Z0-9][\w.-]+)\/?/,
  ];

  extractPaperId(url: string): string | null {
    const match = url.match(this.urlPatterns[0]);
    if (!match) return null;
    // Strip trailing slash from captured ID
    return match[1].replace(/\/$/, '');
  }

  protected createMetadataExtractor(document: Document): MetadataExtractor {
    return new AclAnthologyMetadataExtractor(document);
  }
}

export const aclAnthologyIntegration = new AclAnthologyIntegration();
