import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IApiTechSkill } from '@core/interfaces/content/content.interface';
import { IPaginationResponse, IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
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
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AdminSkillsSectionComponent implements OnChanges {
  @Input({ required: true }) sectionTitle = '';
  @Input({ required: true }) createTitle = '';
  @Input({ required: true }) emptyMessage = '';
  @Input() skills: IApiTechSkill[] = [];
  @Input() draft: Partial<IApiTechSkill> = {};
  @Input() contentLoading = false;
  @Input() actionLoadingKey: string | null = null;
  @Input() pagination: IPaginationResponse<IApiTechSkill> | null = null;
  /** When true, hides the list below the create form */
  @Input() hideList = false;
  /** When true, clicking the gear on a list card moves edit into the top form instead of inline */
  @Input() useTopFormForEdit = false;

  @Output() createSkill = new EventEmitter<void>();
  @Output() saveSkill = new EventEmitter<IApiTechSkill>();
  @Output() deleteSkill = new EventEmitter<IApiTechSkill>();
  @Output() draftIconAssetsChange = new EventEmitter<IProjectAsset[]>();
  @Output() skillIconAssetsChange = new EventEmitter<{ skill: IApiTechSkill; assets: IProjectAsset[] }>();
  @Output() imageUploadError = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

  @ViewChild('topFormRef') topFormRef?: ElementRef<HTMLElement>;

  // ── Top-form edit mode (used when useTopFormForEdit = true) ─────────────
  topFormMode: 'create' | 'edit' = 'create';
  topFormEditSkill: IApiTechSkill | null = null;

  // ── Inline edit (used when useTopFormForEdit = false) ───────────────────
  editingSkillId: string | null = null;
  private readonly snapshots = new Map<string, IApiTechSkill>();

  constructor(private readonly cdr: ChangeDetectorRef) { }

  ngOnChanges(): void {
    // When the skills list refreshes after a save/create, clear the top-form edit state
    if (this.topFormMode === 'edit' && this.topFormEditSkill) {
      const stillExists = this.skills.some((s) => s._id === this.topFormEditSkill?._id);
      if (!stillExists) {
        this.resetTopForm();
      }
    }
  }

  get draftLabel(): string {
    if (this.topFormMode === 'edit' && this.topFormEditSkill) {
      return this.getSkillLabel(this.topFormEditSkill);
    }
    return this.draft.label?.es || this.draft.label?.en || this.draft.value || '';
  }

  get topFormTitle(): string {
    return this.topFormMode === 'edit' ? 'Editar skill' : this.createTitle;
  }

  get topFormCopy(): string {
    return this.topFormMode === 'edit'
      ? 'Modifica los datos de la skill y guarda los cambios.'
      : 'El nombre se replica a espanol e ingles automaticamente.';
  }

  get draftIconAssets(): IProjectAsset[] {
    if (this.topFormMode === 'edit' && this.topFormEditSkill) {
      return this.getSkillIconAssets(this.topFormEditSkill);
    }
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
    if (this.topFormMode === 'edit' && this.topFormEditSkill?._id) {
      return `dashboard-tech-skill-edit-icon-${this.topFormEditSkill._id}`;
    }
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
    if (this.topFormMode === 'edit' && this.topFormEditSkill) {
      this.assignSkillLabel(this.topFormEditSkill, value);
    } else {
      this.assignSkillLabel(this.draft, value);
    }
  }

  onSkillLabelChange(skill: IApiTechSkill, value: string): void {
    this.assignSkillLabel(skill, value);
  }

  onTopFormIconChange(assets: IProjectAsset[]): void {
    if (this.topFormMode === 'edit' && this.topFormEditSkill) {
      this.skillIconAssetsChange.emit({ skill: this.topFormEditSkill, assets });
      if (assets[0]) {
        this.topFormEditSkill.icon = assets[0];
      }
    } else {
      this.draftIconAssetsChange.emit(assets);
    }
  }

  // ── Top-form edit mode ────────────────────────────────────────────────────

  startTopFormEdit(skill: IApiTechSkill): void {
    this.topFormEditSkill = structuredClone(skill);
    this.topFormMode = 'edit';
    setTimeout(() => {
      this.topFormRef?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  cancelTopFormEdit(): void {
    this.resetTopForm();
  }

  commitTopFormEdit(): void {
    if (!this.topFormEditSkill) return;
    const skill = this.topFormEditSkill;
    this.assignSkillLabel(skill, this.getSkillLabel(skill));
    this.saveSkill.emit(skill);
    this.resetTopForm();
  }

  private resetTopForm(): void {
    this.topFormMode = 'create';
    this.topFormEditSkill = null;
  }

  // ── Inline edit (used when useTopFormForEdit = false) ───────────────────

  onSkillAction(skill: IApiTechSkill, action: AdminActionMenuAction): void {
    if (action === 'delete') {
      this.onSkillCardDelete(skill);
      return;
    }
    if (action === 'edit') {
      this.onSkillCardGear(skill);
    }
  }

  onSkillCardGear(skill: IApiTechSkill): void {
    if (this.useTopFormForEdit) {
      this.startTopFormEdit(skill);
    } else {
      if (this.isEditing(skill)) {
        this.cancelEdit(skill);
      } else {
        this.startEdit(skill);
      }
    }
  }

  onSkillCardDelete(skill: IApiTechSkill): void {
    this.deleteSkill.emit(skill);
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

  getSkillLabel(skill: IApiTechSkill | Partial<IApiTechSkill>): string {
    return skill.label?.es || skill.label?.en || skill.value || '';
  }

  getSkillIconAssets(skill: IApiTechSkill | Partial<IApiTechSkill>): IProjectAsset[] {
    if (!skill.icon) {
      return [];
    }

    return [typeof skill.icon === 'string' ? { url: skill.icon } : skill.icon];
  }

  getSkillIconUrl(skill: IApiTechSkill | Partial<IApiTechSkill>): string | null {
    const assets = this.getSkillIconAssets(skill);
    if (!assets[0]) return null;
    return resolveImageAssetUrl(assets[0]);
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
