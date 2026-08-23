import { Component, NgZone } from '@angular/core';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { Toast } from '@capacitor/toast';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from './services/env.service';
import { Router } from '@angular/router';
import { ICloudSyncService } from './services/icloud-sync.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private static readonly MAX_SHARED_TEXT_LEN = 1817;

  constructor(
    private translate: TranslateService,
    public env: EnvService,
    private platform: Platform,
    private router: Router,
    private ngZone: NgZone,
    private iCloudSync: ICloudSyncService,
  ) {
    this.translate.addLangs(this.env.languages);
    this.translate.setDefaultLang('en');

    // Initialize app listeners after platform is ready
    this.platform.ready().then(() => {
      this.initAppListeners();
      document.addEventListener('click', this.handleSettingRowClick);
      // With SplashScreen.launchAutoHide=false we must hide manually.
      // Do it globally so deep-link cold-starts (e.g. share -> result) don't get stuck.
      setTimeout(() => {
        SplashScreen.hide().catch(() => {
          // Ignore
        });
      }, 300);
      // Set flag synchronously before async check to prevent race condition
      this.env.pendingLaunchUrlCheck = true;
      this.checkLaunchUrl();
      this.runAutomaticICloudSync();
    });
  }

  /**
   * Make settings rows easy to use: tapping the label or empty area activates
   * the radio button or toggle at the end of that row as well.
   */
  private readonly handleSettingRowClick = (event: MouseEvent): void => {
    const path = event.composedPath();
    const tagNames = path
      .filter((entry): entry is HTMLElement => entry instanceof HTMLElement)
      .map((entry) => entry.tagName);

    // A direct tap on a control must not be forwarded a second time. Keep
    // links and buttons inside rows independent as well.
    if (
      tagNames.includes('ION-RADIO') ||
      tagNames.includes('ION-TOGGLE') ||
      tagNames.includes('ION-BUTTON') ||
      tagNames.includes('BUTTON') ||
      tagNames.includes('A')
    ) {
      return;
    }

    const item = path.find(
      (entry): entry is HTMLElement =>
        entry instanceof HTMLElement && entry.tagName === 'ION-ITEM',
    );
    if (!item) {
      return;
    }

    const control = item.querySelector<HTMLElement>(
      ':scope > ion-radio[slot="end"], :scope > ion-toggle[slot="end"]',
    );
    control?.click();
  };

  private initAppListeners(): void {
    // Handle app state changes (iOS)
    if (this.platform.is('ios')) {
      App.addListener('appStateChange', async ({ isActive }) => {
        if (this.env.isDebugging) {
          this.presentToast(
            `App state changed. Is active?: ${isActive}`,
            'short',
            'bottom',
          );
        }
        if (isActive) {
          this.runAutomaticICloudSync();
          setTimeout(async () => {
            await SplashScreen.hide();
          }, 300);
        } else {
          this.runAutomaticICloudSync();
          await SplashScreen.show({
            autoHide: false,
          });
        }
      });
    }

    // Handle app URL open (iOS and Android)
    App.addListener('appUrlOpen', async ({ url }) => {
      this.ngZone.run(() => {
        this.handleSharedUrl(url);
      });
    });
  }

  private iCloudSyncRunning = false;

  private async runAutomaticICloudSync(): Promise<void> {
    if (!this.iCloudSync.supported || this.iCloudSyncRunning || !(await this.iCloudSync.isEnabled())) return;
    this.iCloudSyncRunning = true;
    try {
      await this.env.waitForFullInit();
      const result = await this.iCloudSync.synchronize(this.env.scanRecords, this.env.bookmarks);
      await this.env.replaceSynchronizedData(result.records, result.bookmarks);
    } catch {
      // Automatic synchronization stays quiet. The settings page shows errors
      // when the user explicitly requests a sync.
    } finally {
      this.iCloudSyncRunning = false;
    }
  }

  private async checkLaunchUrl(): Promise<void> {
    try {
      const url = await App.getLaunchUrl();
      if (url?.url) {
        this.ngZone.run(() => {
          this.handleSharedUrl(url.url);
        });
      }
    } catch (error) {
      // Ignore
    }
  }

  private handleSharedUrl(url: string): void {
    if (!url) return;

    let sharedText: string | null = null;

    // Handle custom URL scheme: simpleqr://share?text=<encoded_text>
    if (url.startsWith('simpleqr://share?text=')) {
      const encodedText = url.replace('simpleqr://share?text=', '');
      sharedText = decodeURIComponent(encodedText);
    }
    // Handle Android share intent: intent://#Intent;...;S.android.intent.extra.TEXT=<text>;end
    else if (url.includes('android.intent.action.SEND')) {
      const textMatch = url.match(/S\.android\.intent\.extra\.TEXT=([^;]+)/);
      if (textMatch && textMatch[1]) {
        sharedText = decodeURIComponent(textMatch[1]);
      }
    }

    if (sharedText) {
      this.handleSharedText(sharedText);
    }
  }

  private handleSharedText(text: string): void {
    const sanitized = this.sanitizeExternalSharedText(text);
    if (sanitized && sanitized.trim().length > 0) {
      // Set result content and navigate to result page as freeText type
      this.env.resultContent = sanitized;
      this.env.isSharedContent = true; // Mark as shared to force freeText type
      this.env.pendingShareNavigation = true;
      this.env.recordSource = 'external-share';
      this.env.detailedRecordSource = 'external-share';
      this.env.viewResultFrom = '/tabs/history';

      // Navigate to result page - use setTimeout to ensure it happens after initial routing
      setTimeout(() => {
        this.router
          .navigateByUrl('/tabs/result', { replaceUrl: true })
          .finally(() => {
            // Allow normal startup navigation again once result page routing is triggered
            setTimeout(() => {
              this.env.pendingShareNavigation = false;
            }, 300);
          });
      }, 100);
    }
  }

  /**
   * External share text should be treated as plain text.
   * - Strip control chars (except \t, \n, \r) to avoid odd rendering/issues
   * - Trim
   * - Enforce QR max content length (1817 chars) to avoid generating invalid/huge payloads
   */
  private sanitizeExternalSharedText(text: string): string {
    if (!text) return '';

    // Remove ASCII control chars except TAB(0x09), LF(0x0A), CR(0x0D)
    const withoutControlChars = text.replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
      '',
    );

    const trimmed = withoutControlChars.trim();
    if (trimmed.length <= AppComponent.MAX_SHARED_TEXT_LEN) {
      return trimmed;
    }

    // Truncate and notify user
    const truncated = trimmed.slice(0, AppComponent.MAX_SHARED_TEXT_LEN);
    this.presentToast(
      this.translate.instant('MSG.CREATE_QRCODE_MAX_LENGTH'),
      'short',
      'bottom',
    );
    return truncated;
  }

  async presentToast(
    msg: string,
    duration: 'short' | 'long',
    pos: 'top' | 'center' | 'bottom',
  ) {
    await Toast.show({
      text: msg,
      duration: duration,
      position: pos,
    });
  }
}
