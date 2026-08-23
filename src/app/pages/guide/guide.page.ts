import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EnvService } from 'src/app/services/env.service';
import { TranslateService } from '@ngx-translate/core';

interface GuideChapter {
  titleKey: string;
  descriptionKey: string;
  icon: string;
  file: string;
}

@Component({
  selector: 'app-guide',
  templateUrl: './guide.page.html',
  styleUrls: ['./guide.page.scss'],
  standalone: false,
})
export class GuidePage {
  selectedChapter: GuideChapter | undefined;
  renderedChapter: SafeHtml | undefined;
  loading = false;

  readonly chapters: GuideChapter[] = [
    { titleKey: 'GUIDE_QUICKSTART', descriptionKey: 'GUIDE_QUICKSTART_DESC', icon: 'rocket-outline', file: 'schnellstart.md' },
    { titleKey: 'GUIDE_SCAN', descriptionKey: 'GUIDE_SCAN_DESC', icon: 'scan-outline', file: 'scannen.md' },
    { titleKey: 'GUIDE_HISTORY', descriptionKey: 'GUIDE_HISTORY_DESC', icon: 'folder-open-outline', file: 'protokoll-und-gruppen.md' },
    { titleKey: 'GUIDE_TRANSFER', descriptionKey: 'GUIDE_TRANSFER_DESC', icon: 'swap-vertical-outline', file: 'import-und-export.md' },
    { titleKey: 'GUIDE_CREATE', descriptionKey: 'GUIDE_CREATE_DESC', icon: 'create-outline', file: 'codes-erstellen.md' },
    { titleKey: 'GUIDE_SETTINGS', descriptionKey: 'GUIDE_SETTINGS_DESC', icon: 'settings-outline', file: 'einstellungen.md' },
    { titleKey: 'GUIDE_FAQ', descriptionKey: 'GUIDE_FAQ_DESC', icon: 'help-circle-outline', file: 'fehlerbehebung.md' },
    { titleKey: 'GUIDE_PRIVACY', descriptionKey: 'GUIDE_PRIVACY_DESC', icon: 'shield-checkmark-outline', file: 'datenschutz.md' },
  ];

  constructor(
    private readonly http: HttpClient,
    private readonly sanitizer: DomSanitizer,
    public readonly translate: TranslateService,
    public readonly env: EnvService,
  ) {}

  openChapter(chapter: GuideChapter): void {
    this.selectedChapter = chapter;
    this.loading = true;
    this.renderedChapter = undefined;
    this.http.get(`assets/docs/de/${chapter.file}`, { responseType: 'text' }).subscribe({
      next: markdown => {
        this.renderedChapter = this.sanitizer.bypassSecurityTrustHtml(this.markdownToHtml(markdown));
        this.loading = false;
      },
      error: () => {
        this.renderedChapter = this.sanitizer.bypassSecurityTrustHtml(`<p>${this.translate.instant('GUIDE_LOAD_FAILED')}</p>`);
        this.loading = false;
      },
    });
  }

  closeChapter(): void {
    this.selectedChapter = undefined;
    this.renderedChapter = undefined;
  }

  private markdownToHtml(markdown: string): string {
    const escape = (value: string) => value
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const inline = (value: string) => escape(value)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    const html: string[] = [];
    let list: 'ul' | 'ol' | undefined;
    const closeList = () => {
      if (list) html.push(`</${list}>`);
      list = undefined;
    };
    for (const rawLine of markdown.replace(/\r/g, '').split('\n')) {
      const line = rawLine.trim();
      if (!line) { closeList(); continue; }
      const heading = /^(#{1,3})\s+(.+)$/.exec(line);
      if (heading) {
        closeList();
        const level = heading[1].length + 1;
        html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
        continue;
      }
      const unordered = /^[-*]\s+(.+)$/.exec(line);
      const ordered = /^\d+\.\s+(.+)$/.exec(line);
      if (unordered || ordered) {
        const type: 'ul' | 'ol' = unordered ? 'ul' : 'ol';
        if (list !== type) { closeList(); list = type; html.push(`<${type}>`); }
        html.push(`<li>${inline((unordered || ordered)![1])}</li>`);
        continue;
      }
      if (/^---+$/.test(line)) { closeList(); html.push('<hr>'); continue; }
      closeList();
      html.push(`<p>${inline(line)}</p>`);
    }
    closeList();
    return html.join('');
  }
}
