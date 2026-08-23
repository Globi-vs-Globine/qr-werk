import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.page.html',
    styleUrls: ['./landing.page.scss'],
    standalone: false
})
export class LandingPage {

  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    private router: Router,
    private env: EnvService,
    private alertController: AlertController,
  ) { 
    if (this.platform.is('android')) {
      this.platform.backButton.subscribeWithPriority(-1, async () => {
        if (!this.routerOutlet.canGoBack()) {
          if (this.router.url?.startsWith("/tabs/result")) {
            if (this.env.viewResultFrom != null) {
              const from = this.env.viewResultFrom;
              this.router.navigate([`${from}`], { replaceUrl: true });
            }
          } else {
            if (this.router.url?.startsWith("/tabs")) {
              if (this.router.url != this.env.startPage) {
                this.router.navigate([this.env.startPage], { replaceUrl: true });
              } else {
                await this.confirmExitApp();
              }
            }
          }
        }
      });
    }
  }

  async confirmExitApp(): Promise<void> {
    if (this.env.showExitAppAlert == "on") {
      const alert = await this.alertController.create({
        header: this.translate.instant('EXIT_APP'),
        message: this.translate.instant('MSG.EXIT_APP'),
        inputs: [
          {
            type: "checkbox",
            label: this.translate.instant("MSG.TUTORIAL_NOT_SHOW_AGAIN"),
            checked: false,
            handler: async (result) => {
              if (result.checked) {
                this.env.showExitAppAlert = "off";
              } else {
                this.env.showExitAppAlert = "on";
              }
              await Preferences.set({ key: this.env.KEY_SHOW_EXIT_APP_ALERT, value: this.env.showExitAppAlert });
            }
          }
        ],
        cssClass: ['alert-bg', 'alert-input-no-border'],
        buttons: [
          {
            text: this.translate.instant('CANCEL'),
            role: 'cancel'
          },
          {
            text: this.translate.instant('EXIT'),
            role: 'destructive',
            handler: () => {
              navigator['app'].exitApp();
            }
          }
        ]
      });
      await alert.present();
    } else {
      navigator['app'].exitApp();
    }
  }

}
