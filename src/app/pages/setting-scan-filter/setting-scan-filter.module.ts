import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SettingScanFilterPageRoutingModule } from './setting-scan-filter-routing.module';
import { SettingScanFilterPage } from './setting-scan-filter.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TranslateModule, SettingScanFilterPageRoutingModule],
  declarations: [SettingScanFilterPage],
})
export class SettingScanFilterPageModule {}
