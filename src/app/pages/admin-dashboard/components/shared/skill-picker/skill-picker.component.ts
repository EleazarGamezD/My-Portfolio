
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { IApiTechSkill } from '@core/interfaces/content/content.interface';
import { AdminDashboardFacade } from '@core/services/admin-dashboard/admin-dashboard.facade';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { ButtonModule } from '@coreui/angular';
import { AdminSkillsSectionComponent } from '@pages/admin-dashboard/components/skills-section/skills-section.component';

@Component({
  selector: 'app-skill-picker',
  standalone: true,
  imports: [ButtonModule, AdminSkillsSectionComponent],
  templateUrl: './skill-picker.component.html',
  styleUrl: './skill-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillPickerComponent implements OnInit, OnChanges, DoCheck {
  /** IDs of currently selected skills */
  @Input() selectedIds: string[] = [];
  /** Whether to show the "primary skill" feature (for projects) */
  @Input() showPrimary = false;
  /** The primary skill ID (only relevant when showPrimary=true) */
  @Input() primarySkillId: string | null = null;
  /** Number of skill cards shown per page */
  @Input() pageSize = 8;
  /** Section title shown in the panel header */
  @Input() panelTitle = 'Skills';
  /** Copy text shown under the panel title */
  @Input() panelCopy = 'Selecciona las skills relacionadas.';

  @Output() selectedIdsChange = new EventEmitter<string[]>();
  @Output() primaryChange = new EventEmitter<string | null>();

  showSkillsLibrary = false;
  currentPage = 1;
  private _lastSkillCount = -1;

  constructor(
    public readonly facade: AdminDashboardFacade,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.facade.loadTechSkillsContent();
    this.cdr.markForCheck();
  }

  ngOnChanges(): void {
    this.currentPage = 1;
  }

  ngDoCheck(): void {
    const count = this.facade.techSkills.length;
    if (count !== this._lastSkillCount) {
      this._lastSkillCount = count;
      this.cdr.markForCheck();
    }
  }

  // ── Computed ─────────────────────────────────────────────────────────────

  get availableSkills(): IApiTechSkill[] {
    return this.facade.techSkills;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.availableSkills.length / this.pageSize));
  }

  get pagedSkills(): IApiTechSkill[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.availableSkills.slice(start, start + this.pageSize);
  }

  get hasPrevPage(): boolean {
    return this.currentPage > 1;
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  get selectedCount(): number {
    return this.selectedIds.length;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // ── Selection ─────────────────────────────────────────────────────────────

  isSelected(skillId: string): boolean {
    return this.selectedIds.includes(skillId);
  }

  isPrimary(skillId: string): boolean {
    return this.primarySkillId === skillId;
  }

  toggleSkill(skillId: string): void {
    const updated = this.isSelected(skillId)
      ? this.selectedIds.filter((id) => id !== skillId)
      : [...this.selectedIds, skillId];

    this.selectedIdsChange.emit(updated);

    if (this.showPrimary && this.primarySkillId === skillId && !updated.includes(skillId)) {
      this.primaryChange.emit(updated[0] ?? null);
    }
  }

  setPrimary(event: Event, skillId: string): void {
    event.stopPropagation();
    if (!this.isSelected(skillId)) {
      return;
    }
    this.primaryChange.emit(skillId);
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  prevPage(): void {
    if (this.hasPrevPage) {
      this.currentPage--;
      this.cdr.markForCheck();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.cdr.markForCheck();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.markForCheck();
    }
  }

  // ── Library toggle ────────────────────────────────────────────────────────

  toggleLibrary(): void {
    this.showSkillsLibrary = !this.showSkillsLibrary;
    this.cdr.markForCheck();
  }

  async onCreateSkill(): Promise<void> {
    await this.facade.createContentItem('techSkills');
    this.cdr.markForCheck();
  }

  async onSaveSkill(skill: IApiTechSkill): Promise<void> {
    await this.facade.saveContentItem('techSkills', skill);
    this.cdr.markForCheck();
  }

  async onDeleteSkill(skill: IApiTechSkill): Promise<void> {
    await this.facade.deleteContentItem('techSkills', skill);
    this.cdr.markForCheck();
  }

  // ── Display helpers ───────────────────────────────────────────────────────

  getSkillLabel(skill: IApiTechSkill): string {
    return skill.label?.es || skill.label?.en || skill.value || '';
  }

  getSkillIconUrl(skill: IApiTechSkill): string | null {
    return resolveImageAssetUrl(skill.icon ?? null);
  }
}
