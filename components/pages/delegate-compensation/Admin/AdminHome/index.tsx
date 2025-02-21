import { VersionHandler } from '../VersionHandler';

interface Props {
  delegateAddress?: string;
  shouldShowDelegate?: 'block' | 'dropdown' | 'none';
  isPublic?: boolean;
}

export const DelegateCompensationAdminHomeVersioning = (props: Props) => (
  <VersionHandler component="AdminHome" componentProps={props} />
);
