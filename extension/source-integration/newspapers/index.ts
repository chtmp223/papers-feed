// extension/source-integration/newspapers/index.ts
// Multi-source newspapers integration (NYT, New Yorker, Paris Review)

import { BaseSourceIntegration } from '../base-source';
import { MetadataExtractor, generatePaperIdFromUrl } from '../metadata-extractor';

class NewspapersMetadataExtractor extends MetadataExtractor {
  protected extractTitle(): string {
    return (
      this.getMetaContent('meta[property="og:title"]') ||
      this.getMetaContent('meta[name="citation_title"]') ||
      this.getMetaContent('meta[name="title"]') ||
      super.extractTitle()
    );
  }

  protected extractAuthors(): string {
    // OpenGraph author
    const ogAuthor = this.getMetaContent('meta[property="article:author"]') ||
                     this.getMetaContent('meta[name="author"]');
    if (ogAuthor) return ogAuthor;

    // NYT-specific byline
    const bylEl = this.document.querySelector('meta[name="byl"]');
    if (bylEl) {
      const byl = bylEl.getAttribute('content');
      if (byl) return byl.replace(/^By\s+/i, '');
    }

    return super.extractAuthors();
  }

  protected extractDescription(): string {
    return (
      this.getMetaContent('meta[property="og:description"]') ||
      this.getMetaContent('meta[name="description"]') ||
      super.extractDescription()
    );
  }

  protected extractPublishedDate(): string {
    // NYT-specific pdate
    const pdate = this.getMetaContent('meta[name="pdate"]');
    if (pdate) return pdate;

    return (
      this.getMetaContent('meta[property="article:published_time"]') ||
      this.getMetaContent('meta[name="date"]') ||
      super.extractPublishedDate()
    );
  }

  protected extractJournalName(): string {
    return (
      this.getMetaContent('meta[property="og:site_name"]') ||
      super.extractJournalName()
    );
  }

  protected extractTags(): string[] {
    // NYT-specific news_keywords
    const newsKeywords = this.getMetaContent('meta[name="news_keywords"]');
    if (newsKeywords) {
      return newsKeywords.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    const keywords = this.getMetaContent('meta[name="keywords"]') ||
                     this.getMetaContent('meta[property="article:tag"]');
    if (keywords) {
      return keywords.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    return [];
  }
}

export class NewspapersIntegration extends BaseSourceIntegration {
  readonly id = 'newspapers';
  readonly name = 'Newspapers';

  readonly urlPatterns = [
    /nytimes\.com\/\d{4}\/\d{2}\/\d{2}\/[\w-]+\/[\w-]+/,
    /newyorker\.com\/[\w-]+\/[\w-]+\/[\w-]+/,
    /theparisreview\.org\/[\w-]+\/\d+\/[\w-]+/,
  ];

  extractPaperId(url: string): string | null {
    // No academic IDs for newspaper articles, use hash-based ID
    if (this.canHandleUrl(url)) {
      return generatePaperIdFromUrl(url);
    }
    return null;
  }

  protected createMetadataExtractor(document: Document): MetadataExtractor {
    return new NewspapersMetadataExtractor(document);
  }
}

export const newspapersIntegration = new NewspapersIntegration();
