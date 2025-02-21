import { Flex, Spinner, Switch, Text, useToast } from '@chakra-ui/react';

import axios from 'axios';
import { useAuth, useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { API_ROUTES, KARMA_API } from 'helpers';
import { useState } from 'react';

export const DelegateOptSwitch = () => {
  const { authToken } = useAuth();
  const { theme } = useDAO();
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const { daoInfo } = useDAO();
  const { delegateInfo, refreshDelegateInfo } = useDelegateCompensation();
  const optedIn = delegateInfo?.incentiveOptedIn;

  const onSave = async () => {
    setIsSaving(true);
    try {
      if (!delegateInfo) {
        throw new Error('Delegate info not found');
      }
      const authorizedAPI = axios.create({
        timeout: 30000,
        baseURL: KARMA_API.base_url,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
      });

      await authorizedAPI.put(
        API_ROUTES.DELEGATE.CHANGE_INCENTIVE_PROGRAM_STATS(
          daoInfo.config.DAO_KARMA_ID,
          delegateInfo.id
        ),
        {
          incentiveOptedIn: !optedIn,
        }
      );
      toast({
        title: 'Success',
        description: 'Delegate updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      refreshDelegateInfo();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Flex flexDir="row" gap="2" align="center">
      <Switch
        isChecked={optedIn}
        onChange={() => {
          onSave();
        }}
        isDisabled={isSaving}
        disabled={isSaving}
      />
      <Text color={theme.compensation?.card.text}>
        Opted-in to Incentive Program
      </Text>
      {isSaving && <Spinner size="sm" />}
    </Flex>
  );
};
