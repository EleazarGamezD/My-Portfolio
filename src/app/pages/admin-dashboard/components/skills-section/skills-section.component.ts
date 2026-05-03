import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IApiTechSkill } from '@core/interfaces/content/content.interface';
import { IProjectAsset, IPaginationResponse } from '@core/interfaces/projects/projects.interfaces';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { BadgeModule, ButtonModule, CardModule, FormModule, SpinnerModule } from '@coreui/angular';
import {
  AdminActionMenuAction,
  AdminActionMenuComponent,
} from '@pages/admin-dashboard/components/admin-action-menu/admin-action-menu.component';
import { AddPhotoComponent } from '@pages/admin-dashboard/components/shared/add-photo/add-photo.component';
import { PhotoEditorComponent } from '@pages/admin-dashboard/components/shared/photo-editor/photo-editor.component';

@Component({
  selector: 'app-admin-skills-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    FormModule,
    SpinnerModule,
    AddPhotoComponent,
    PhotoEditorComponent,
    AdminActionMenuComponent,
  ],
  templateUrl: './skills-section.component.html',
  styleUrl: './skills-section.component.scss',
})
export class AdminSkillsSectionComponent {
  @Input({ required: true }) sectionTitle = '';
  @Input({ required: true }) createTitle = '';
  @Input({ required: true }) emptyMessage = '';
  @Input() skills: IApiTechSkill[] = [];
  @Input() draft: Partial<IApiTechSkill> = {};
  @Input() contentLoading = false;
  @Input() actionLoadingKey: string | null = null;
  @Input() pagination: IPaginationResponse<IApiTechSkill> | null = null;

  @Output() createSkill = new EventEmitter<void>();
  @Output() saveSkill = new EventEmitter<IApiTechSkill>();
  @Output() deleteSkill = new EventEmitter<IApiTechSkill>();
  @Output() draftIconAssetsChange = new EventEmitter<IProjectAsset[]>();
  @Output() skillIconAssetsChange = new EventEmitter<{ skill: IApiTechSkill; assets: IProjectAsset[] }>();
  @Output() imageUploadError = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

  editingSkillId: string | null = null;
  private readonly snapshots = new Map<string, IApiTechSkill>();

  get draftLabel(): string {
    return this.draft.label?.es || this.draft.label?.en || this.draft.value || '';
  }

  get draftIconAssets(): IProjectAsset[] {
    const icon = this.draft.icon;
    if (!icon) {
      return [];
    }

    return [typeof icon === 'string' ? { url: icon } : icon];
  }

  get draftIconPreviewUrls(): string[] {
    return this.draftIconAssets
      .map((asset) => resolveImageAssetUrl(asset))
      .filter((url): url is string => Boolean(url));
  }

  get draftStorageKey(): string {
    return 'dashboard-tech-skill-draft-icon';
  }

  get currentPage(): number {
    return this.pagination?.currentPage ?? 1;
  }

  get totalPages(): number {
    return this.pagination?.totalPages ?? 1;
  }

  get totalItems(): number {
    return this.pagination?.totalItems ?? this.skills.length;
  }

  get hasPagination(): boolean {
    return this.totalPages > 1;
  }

  onDraftLabelChange(value: string): void {
    this.assignSkillLabel(this.draft, value);
  }

  onSkillLabelChange(skill: IApiTechSkill, value: string): void {
    this.assignSkillLabel(skill, value);
  }

  onSkillAction(skill: IApiTechSkill, action: AdminActionMenuAction): void {
    if (action === 'delete') {
      this.deleteSkill.emit(skill);
      return;
    }

    if (action === 'edit') {
      this.startEdit(skill);
    }
  }

  startEdit(skill: IApiTechSkill): void {
    if (!skill._id) {
      return;
    }

    this.snapshots.set(skill._id, structuredClone(skill));
    this.editingSkillId = skill._id;
  }

  cancelEdit(skill: IApiTechSkill): void {
    if (!skill._id) {
      this.editingSkillId = null;
      return;
    }

    const snapshot = this.snapshots.get(skill._id);
    if (snapshot) {
      Object.assign(skill, snapshot);
    }

    this.snapshots.delete(skill._id);
    this.editingSkillId = null;
  }

  commitEdit(skill: IApiTechSkill): void {
    if (!skill._id) {
      return;
    }

    this.assignSkillLabel(skill, this.getSkillLabel(skill));
    this.saveSkill.emit(skill);
    this.snapshots.delete(skill._id);
    this.editingSkillId = null;
  }

  getSkillLabel(skill: IApiTechSkill): string {
    return skill.label?.es || skill.label?.en || skill.value || '';
  }

  getSkillIconAssets(skill: IApiTechSkill): IProjectAsset[] {
    if (!skill.icon) {
      return [];
    }

    return [typeof skill.icon === 'string' ? { url: skill.icon } : skill.icon];
  }

  isEditing(skill: IApiTechSkill): boolean {
    return Boolean(skill._id && this.editingSkillId === skill._id);
  }

  isActionLoading(actionKey: string): boolean {
    return this.actionLoadingKey === actionKey;
  }

  changePage(page: number): void {
    if (!this.pagination || page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.pageChange.emit(page);
  }

  private assignSkillLabel(target: Partial<IApiTechSkill>, value: string): void {
    const normalized = this.normalizeSkillLabel(value);
    target.label = { es: normalized, en: normalized };
    target.title = { es: normalized, en: normalized };
    target.value = normalized;
  }

  private normalizeSkillLabel(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
