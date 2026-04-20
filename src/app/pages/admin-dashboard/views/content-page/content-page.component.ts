import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IApiContentItem } from '@core/interfaces/content/content.interface';
import { AlertModule } from '@coreui/angular';
import {
  AdminDashboardFacade,
  ContentResourceName,
} from '@core/services/admin-dashboard/admin-dashboard.facade';
import {
  AdminContentSectionComponent,
  AdminContentSectionVariant,
} from '@pages/admin-dashboard/components/content-section/content-section.component';

type ContentResourcePage = Exclude<ContentResourceName, 'resumes'>;

interface AdminContentPageData {
  resourceName: ContentResourcePage;
  variant: AdminContentSectionVariant;
  sectionTitle: string;
  createTitle: string;
  emptyMessage: string;
  kicker: string;
  description: string;
}

@Component({
  selector: 'app-admin-content-page',
  standalone: true,
  imports: [CommonModule, AlertModule, AdminContentSectionComponent],
  templateUrl: './content-page.component.html',
  styleUrl: './content-page.component.scss',
})
export class AdminContentPageComponent implements OnInit {
  config!: AdminContentPageData;

  constructor(
    public readonly facade: AdminDashboardFacade,
    private readonly route: ActivatedRoute,
  ) {}

  async ngOnInit(): Promise<void> {
    this.config = this.route.snapshot.data as AdminContentPageData;
    await this.facade.ensureContentReady();
  }

  get items(): IApiContentItem[] {
    return this.facade.getContentItems(this.config.resourceName);
  }

  get draft(): Partial<IApiContentItem> {
    return this.facade.getContentDraft(this.config.resourceName);
  }
}
