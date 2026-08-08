export enum TechSkillCategory {
  LANGUAGES = 'languages',
  BACKEND = 'backend',
  FRONTEND = 'frontend',
  DATA_TESTING = 'data-testing',
  DEVOPS = 'devops',
  TOOLS = 'tools',
}

export enum TechSkillCategoryLabel {
  LANGUAGES = 'Lenguajes',
  BACKEND = 'Backend',
  FRONTEND = 'Frontend',
  DATA_TESTING = 'Datos y pruebas',
  DEVOPS = 'Cloud y DevOps',
  TOOLS = 'Herramientas',
}

export const TECH_SKILL_CATEGORY_OPTIONS = [
  { value: TechSkillCategory.LANGUAGES, label: TechSkillCategoryLabel.LANGUAGES },
  { value: TechSkillCategory.BACKEND, label: TechSkillCategoryLabel.BACKEND },
  { value: TechSkillCategory.FRONTEND, label: TechSkillCategoryLabel.FRONTEND },
  { value: TechSkillCategory.DATA_TESTING, label: TechSkillCategoryLabel.DATA_TESTING },
  { value: TechSkillCategory.DEVOPS, label: TechSkillCategoryLabel.DEVOPS },
  { value: TechSkillCategory.TOOLS, label: TechSkillCategoryLabel.TOOLS },
] as const;
