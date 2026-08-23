import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingScanFilterPage } from './setting-scan-filter.page';

const routes: Routes = [{ path: '', component: SettingScanFilterPage }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class SettingScanFilterPageRoutingModule {}
