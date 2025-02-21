import { VersionHandler } from '../VersionHandler';

interface Props {
  delegateAddress: string;
  isPublic?: boolean;
}

export const DelegateCompensationAdminForumActivityVersioning = (
  props: Props
) => <VersionHandler component="AdminForumActivity" componentProps={props} />;
