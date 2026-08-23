import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { GuidePageRoutingModule } from './guide-routing.module';
import { GuidePage } from './guide.page';

@NgModule({
  imports: [CommonModule, HttpClientModule, IonicModule, TranslateModule, GuidePageRoutingModule],
  declarations: [GuidePage],
})
export class GuidePageModule {}
