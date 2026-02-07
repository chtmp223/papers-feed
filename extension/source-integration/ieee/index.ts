// extension/source-integration/ieee/index.ts
// IEEE Xplore integration with custom metadata extractor

import { BaseSourceIntegration } from '../base-source';
import { MetadataExtractor } from '../metadata-extractor';

class IeeeMetadataExtractor extends MetadataExtractor {
  protected extractTitle(): string {
    return (
      this.getMetaContent('meta[name="citation_title"]') ||
      this.getMetaContent('meta[property="og:title"]') ||
      super.extractTitle()
    );
  }

  protected extractAuthors(): string {
    // IEEE uses multiple citation_author meta tags
    const authors: string[] = [];
    this.document.querySelectorAll('meta[name="citation_author"]').forEach(el => {
      const content = el.getAttribute('content');
      if (content) authors.push(content);
    });
    if (authors.length > 0) {
      return authors.join(', ');
    }
    // DOM fallback for JS-rendered pages
    const authorElements = this.document.querySelectorAll('.authors-info .author-name, .author-card .name');
    if (authorElements.length > 0) {
      return Array.from(authorElements)
        .map(el => el.textContent?.trim())
        .filter(Boolean)
        .join(', ');
    }
    return super.extractAuthors();
  }

  protected extractDescription(): string {
    // DOM fallback for abstract
    const abstractEl = this.document.querySelector('.abstract-text, div[class*="abstract"]');
    const abstractText = abstractEl?.textContent?.trim();
    return (
      this.getMetaContent('meta[name="citation_abstract"]') ||
      this.getMetaContent('meta[property="og:description"]') ||
      abstractText ||
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
      this.getMetaContent('meta[name="citation_journal_title"]') ||
      this.getMetaContent('meta[name="citation_conference_title"]') ||
      super.extractJournalName()
    );
  }

  protected extractTags(): string[] {
    // IEEE uses citation_keywords
    const keywords = this.getMetaContent('meta[name="citation_keywords"]') ||
                     this.getMetaContent('meta[name="keywords"]');
    if (keywords) {
      return keywords.split(/[,;]/).map(tag => tag.trim()).filter(Boolean);
    }
    return [];
  }
}

export class IeeeIntegration extends BaseSourceIntegration {
  readonly id = 'ieee';
  readonly name = 'IEEE Xplore';

  readonly urlPatterns = [
    /ieeexplore\.ieee\.org\/document\/(\d+)/,
  ];

  extractPaperId(url: string): string | null {
    const match = url.match(this.urlPatterns[0]);
    return match ? match[1] : null;
  }

  protected createMetadataExtractor(document: Document): MetadataExtractor {
    return new IeeeMetadataExtractor(document);
  }
}

export const ieeeIntegration = new IeeeIntegration();
