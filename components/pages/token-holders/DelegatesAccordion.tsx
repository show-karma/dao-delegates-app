import { Accordion, Flex } from '@chakra-ui/react';
import { useTokenHolders, VotesProvider } from 'contexts';
import moment from 'moment';
import { useMemo, FC } from 'react';
import { IDelegationHistoryAPI } from 'types';
import { DelegationCard } from './DelegationCard';

interface IDelegatesAccordionProps {
  holderData: IDelegationHistoryAPI;
}

export const DelegatesAccordion: FC<IDelegatesAccordionProps> = ({
  holderData,
}) => {
  const { selectedAddressesData } = useTokenHolders();

  const dataArray = holderData.delegatingHistories;

  const lastDelegation = dataArray[0];

  return useMemo(
    () => (
      <VotesProvider
        address={lastDelegation.toDelegate}
        selectedTimeframe={{
          from: lastDelegation.timestamp,
          to: moment(new Date()).unix(),
        }}
      >
        <Flex w="full">
          <Accordion w="full" allowMultiple defaultIndex={[0]}>
            <DelegationCard
              userDelegatedTo={{
                address: lastDelegation.toDelegate,
              }}
              userDelegating={{
                address: holderData.publicAddress,
                name: holderData.ensName,
                picture: holderData.profilePicture || '',
                amountDelegated: holderData.totalDelegatedVotes,
              }}
              data={dataArray}
              selectedDelegation={lastDelegation}
            />
          </Accordion>
        </Flex>
      </VotesProvider>
    ),
    [selectedAddressesData]
  );
};
