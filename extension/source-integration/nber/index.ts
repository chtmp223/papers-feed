// extension/source-integration/nber/index.ts
// NBER Working Papers integration

import { BaseSourceIntegration } from '../base-source';
import { MetadataExtractor } from '../metadata-extractor';

class NberMetadataExtractor extends MetadataExtractor {
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
    return (
      this.getMetaContent('meta[name="citation_abstract"]') ||
      this.getMetaContent('meta[property="og:description"]') ||
      this.getMetaContent('meta[name="description"]') ||
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
    return 'NBER Working Papers';
  }

  protected extractTags(): string[] {
    const keywords = this.getMetaContent('meta[name="keywords"]');
    if (keywords) {
      return keywords.split(',').map(tag => tag.trim());
    }
    return [];
  }
}

export class NberIntegration extends BaseSourceIntegration {
  readonly id = 'nber';
  readonly name = 'NBER';

  readonly urlPatterns = [
    /nber\.org\/papers\/(w?\d+)/,
  ];

  extractPaperId(url: string): string | null {
    const match = url.match(this.urlPatterns[0]);
    return match ? match[1] : null;
  }

  protected createMetadataExtractor(document: Document): MetadataExtractor {
    return new NberMetadataExtractor(document);
  }
}

export const nberIntegration = new NberIntegration();
