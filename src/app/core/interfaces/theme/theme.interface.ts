export interface IThemeColors {
  baseColor: string;
  veryLightGray: string;
  darkGray: string;
  mediumGray: string;
  lightMediumGray: string;
  altFont: string;
  primaryFont: string;
}

export const DEFAULT_THEME_COLORS: IThemeColors = {
  baseColor: '#c84b31',
  veryLightGray: '#ecf0f1',
  darkGray: '#2e4052',
  mediumGray: '#7f8c8d',
  lightMediumGray: '#bdc3c7',
  altFont: '"Rufina", serif',
  primaryFont: '"Jost", sans-serif',
};

export const FONT_OPTIONS = [
  { label: 'Rufina (Serif elegante)', value: '"Rufina", serif' },
  { label: 'Jost (Sans moderna)', value: '"Jost", sans-serif' },
  { label: 'Inter (Sans neutra)', value: '"Inter", sans-serif' },
  { label: 'Plus Jakarta Sans (Sans contemporánea)', value: '"Plus Jakarta Sans", sans-serif' },
  { label: 'Playfair Display (Serif clásica)', value: '"Playfair Display", serif' },
  { label: 'Montserrat (Sans geométrica)', value: '"Montserrat", sans-serif' },
  { label: 'Poppins (Sans circular)', value: '"Poppins", sans-serif' },
  { label: 'Lato (Sans humanista)', value: '"Lato", sans-serif' },
  { label: 'Oswald (Display condensada)', value: '"Oswald", sans-serif' },
  { label: 'Raleway (Sans elegante)', value: '"Raleway", sans-serif' },
];

export interface ITheme {
  _id?: string;
  name: string;
  active: boolean;
  colors: IThemeColors;
  createdAt?: string;
  updatedAt?: string;
}
