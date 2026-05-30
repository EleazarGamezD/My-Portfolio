export interface IThemeColors {
  baseColor: string;
}

export interface ITheme {
  _id?: string;
  name: string;
  active: boolean;
  colors: IThemeColors;
  createdAt?: string;
  updatedAt?: string;
}
