import { VersionHandler } from '../VersionHandler';

interface Props {
  delegateAddress?: string;
  shouldShowDelegate?: 'block' | 'dropdown' | 'none';
  isPublic?: boolean;
}

export const DelegateCompensationAdminDelegatesVersioning = (props: Props) => (
  <VersionHandler component="AdminDelegates" componentProps={props} />
);
