import { Flex, Switch, Text, useDisclosure } from '@chakra-ui/react';
import { LinkProxy } from 'components/Modals/Proxy';
import { UnlinkProxy } from 'components/Modals/Proxy/Unlink';
import { useProxy } from 'contexts';
import { FC } from 'react';

export const ProxySwitch: FC = () => {
  const {
    isOpen: isOpenLink,
    onOpen: onOpenLink,
    onClose: onCloseLink,
  } = useDisclosure();
  const {
    isOpen: isOpenUnlink,
    onOpen: onOpenUnlink,
    onClose: onCloseUnlink,
  } = useDisclosure();

  const { hasProxy } = useProxy();

  return (
    <>
      <Flex flexDir="row" gap="2" align="center">
        <Text>Use as Proxy</Text>
        <Switch
          defaultChecked={hasProxy}
          isChecked={hasProxy}
          onChange={() => {
            if (hasProxy) {
              onOpenUnlink?.();
            } else {
              onOpenLink?.();
            }
          }}
        />
      </Flex>
      <LinkProxy isOpen={isOpenLink} onClose={onCloseLink} />
      <UnlinkProxy isOpen={isOpenUnlink} onClose={onCloseUnlink} />
    </>
  );
};
