import { IDAOConfig } from './config';
import { IDAOTheme } from './theme';

export interface IDAOInfo {
  config: IDAOConfig;
  light: IDAOTheme;
  dark: IDAOTheme;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ABI: any;
}
