import { Text } from '@chakra-ui/react';
import axios from 'axios';
import { useDAO, useEditProfile, useWallet } from 'contexts';
import { useToasty } from 'hooks';
import { useEffect, useMemo, useState } from 'react';
import { Hex } from 'types';
import { DelegateRegistryContract } from 'utils/delegate-registry/DelegateRegistry';
import { DelegateProfile } from 'utils/delegate-registry/types';
import { useSwitchNetwork } from 'wagmi';

interface GasfreeButtonProps {
  title?: string;
}

export const GasfreeButton: React.FC<GasfreeButtonProps> = ({
  title = 'Save',
}) => {
  const { address, isConnected, openConnectModal, chain } = useWallet();
  const {
    daoInfo: { config },
  } = useDAO();

  const {
    newInterests,
    newName,
    newStatement,
    newProfilePicture,
    setEditSaving,
    saveEdit,
  } = useEditProfile();

  const { toast } = useToasty();

  const [recallAfterAction, setRecallAfterAction] = useState(false);

  const profile: DelegateProfile = useMemo(
    () => ({
      ipfsMetadata: null,
      name: newName || null,
      profilePictureUrl: newProfilePicture || '',
      statement: newStatement.value as string,
      interests: (newInterests.value as string[])?.join(',') || '',
      status: 'Active',
    }),
    [newInterests, newName, newProfilePicture, newStatement]
  );

  const sendSponsoredTx = async () => {
    const {
      DELEGATE_REGISTRY_CONTRACT,
      DAO_DELEGATE_CONTRACT,
      ENABLE_ONCHAIN_REGISTRY,
    } = config;

    if (
      !(
        ENABLE_ONCHAIN_REGISTRY &&
        DELEGATE_REGISTRY_CONTRACT &&
        DAO_DELEGATE_CONTRACT
      )
    )
      return;

    const { ADDRESS: REGISTRY_CONTRACT, NETWORK } = DELEGATE_REGISTRY_CONTRACT;

    if (isConnected && address && chain?.id) {
      const contract = new DelegateRegistryContract(REGISTRY_CONTRACT);

      try {
        setEditSaving(true);
        const payload = await contract.registerDelegateBySig(address as Hex, {
          profile,
          tokenAddress: DAO_DELEGATE_CONTRACT[0].contractAddress[0],
          tokenChainId: NETWORK,
        });

        if (!payload) throw new Error('Something went wrong');

        const { data } = await axios.post<{ txId: string }>(
          '/api/sponsor',
          payload
        );

        const { txId } = data;
        // I'll let it here for confirmation (and debug) reasons
        // because we don't show the toast
        // eslint-disable-next-line no-console
        console.info('Transaction hash', { txId });
        saveEdit();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast({
          title: 'Transaction failed',
          description: err.response?.data || err.message,
          status: 'error',
        });
        setEditSaving(false);
      }
    }
  };

  const { switchNetwork } = useSwitchNetwork({
    chainId: 10,
  });

  const handleOnClick = () => {
    if (!isConnected || !address) {
      openConnectModal?.();
      setRecallAfterAction(true);
      return;
    }

    if (chain?.id !== 10) {
      toast({
        title: 'Wrong network',
        description: 'Please switch to Optimism network',
        status: 'error',
      });

      switchNetwork?.();
      setRecallAfterAction(true);
      return;
    }

    sendSponsoredTx();
  };

  useEffect(() => {
    if (recallAfterAction) {
      setRecallAfterAction(false);
      handleOnClick();
    }
  }, [chain, isConnected]);

  return (
    <Text as="span" onClick={handleOnClick}>
      {title}
    </Text>
  );
};
