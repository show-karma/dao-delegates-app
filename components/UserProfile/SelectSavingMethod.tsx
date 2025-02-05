import { Box, Button, Flex, Spinner, Text } from '@chakra-ui/react';
import { GasfreeButton } from 'components/HeaderHat/GasfreeButton';
import { useDAO } from 'contexts';
import { useState } from 'react';
import { convertHexToRGBA } from 'utils';

const onChainText =
  'All of your information is stored on the blockchain, allowing other delegation websites to access and display the same information. You will have to pay a small gas fee to save onchain.';

const offChainText =
  'Your information is stored in our system.  Other delegation platforms in the ecosystem will not be able to display the same information.';
interface SelectSavingMethodProps {
  onSubmit: (method: 'on-chain' | 'off-chain' | null) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const SelectBox: React.FC<{
  label: string;
  description: string;
  value: 'on-chain' | 'off-chain';
  selected: boolean;
  onChange: (value: 'on-chain' | 'off-chain') => void;
  tag?: string;
}> = ({ description, label, onChange, value, tag, selected }) => (
  <Flex
    userSelect="none"
    cursor="pointer"
    onClick={() => onChange(value)}
    border="1px solid white"
    color={selected ? '#2C1A57' : 'white'}
    background={selected ? '#F5E8FF' : 'transparent'}
    transition="200ms ease-in-out"
    borderRadius="md"
    px="3"
    py="3"
    mb={5}
  >
    <Box>
      <Box
        height="22px"
        width="22px"
        borderRadius="10px"
        border={`2px solid ${selected ? '#0FAC85' : 'white'}`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        __css={{
          '::before': {
            content: '""',
            display: 'block',
            transition: '300ms ease-in-out',
            height: selected ? '11px' : '0%',
            width: selected ? '11px' : '0%',
            borderRadius: '21px',
            backgroundColor: selected ? '#0FAC85' : 'transparent',
          },
        }}
        mr="3"
      />
    </Box>
    <Box>
      <Flex gap="3" align="center" mb={3}>
        <Text fontWeight="bold">{label}</Text>
        {!!tag && (
          <Text
            color="#1DE9B6"
            backgroundColor="#1A1D2D"
            px="4"
            fontSize={14}
            height="max-content"
            borderRadius="lg"
          >
            {tag}
          </Text>
        )}
      </Flex>
      <Box>
        <Text>{description}</Text>
      </Box>
    </Box>
  </Flex>
);

export const SelectSavingMethod: React.FC<SelectSavingMethodProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const { theme, daoInfo } = useDAO();
  const [method, setMethod] = useState<'on-chain' | 'off-chain' | null>(null);

  return (
    <Flex flexWrap="wrap">
      <Flex justifyContent="flex-start" w="full" direction="column">
        {daoInfo.config.ENABLE_ONCHAIN_REGISTRY &&
          !!daoInfo.config.DELEGATE_REGISTRY_CONTRACT && (
            <SelectBox
              selected={method === 'on-chain'}
              label="Save to onchain registry"
              description={onChainText}
              value="on-chain"
              tag="Recommended"
              onChange={value => (isLoading ? null : setMethod(value))}
            />
          )}
        <SelectBox
          selected={method === 'off-chain'}
          label="Save locally"
          description={offChainText}
          value="off-chain"
          onChange={value => (isLoading ? null : setMethod(value))}
        />
      </Flex>
      <Flex justifyContent="flex-end" alignItems="center" w="full" gap="10">
        <Button variant="link" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          background={theme.branding}
          px={['4', '6']}
          py={['3', '6']}
          h="10"
          fontSize={['md']}
          fontWeight="medium"
          isDisabled={isLoading || method === null}
          onClick={() => onSubmit(method)}
          _hover={{
            backgroundColor: convertHexToRGBA(theme.branding, 0.8),
          }}
          _focus={{}}
          _active={{}}
          color={theme.buttonText}
        >
          <Flex gap="2" align="center" px="4">
            {isLoading && <Spinner />}
            {method === 'on-chain' ? <GasfreeButton title="Save" /> : 'Save'}
          </Flex>
        </Button>
      </Flex>
    </Flex>
  );
};
