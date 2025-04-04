import {
  Flex,
  Icon,
  IconProps,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  TextProps,
} from '@chakra-ui/react';
import { ChakraLink } from 'components/ChakraLink';
import { useDAO } from 'contexts';
import { FaDiscourse, FaExternalLinkAlt } from 'react-icons/fa';

interface HandlesTooltipProps {
  handles: string[];
  iconProps?: IconProps;
  textProps?: TextProps;
}
export const HandlesTooltip = ({
  handles,
  iconProps = {},
  textProps = {},
}: HandlesTooltipProps) => {
  const { theme, daoInfo } = useDAO();
  return (
    <Flex flexDir="row" gap="2" align="center">
      {handles && handles?.length > 0 ? (
        <Popover placement="bottom" trigger="click">
          <PopoverTrigger>
            <Flex cursor="pointer" _hover={{ opacity: 0.8 }} align="center">
              <Icon
                as={FaDiscourse}
                color={theme.compensation?.card.secondaryText}
                _hover={{
                  transform: 'scale(1.25)',
                }}
                boxSize="24px"
                {...iconProps}
              />
              {handles.length > 1 && (
                <Text
                  ml="1"
                  fontSize="xs"
                  color={theme.compensation?.card.secondaryText}
                  {...textProps}
                >
                  ({handles.length})
                </Text>
              )}
            </Flex>
          </PopoverTrigger>
          <PopoverContent
            width="auto"
            maxW="300px"
            bg={theme.compensation?.card.bg}
            borderColor={theme.compensation?.card.divider}
          >
            <PopoverArrow bg={theme.compensation?.card.bg} />
            <PopoverBody>
              <Flex flexDir="column" gap="2">
                {handles.map(handle => (
                  <ChakraLink
                    key={handle}
                    href={`${daoInfo.config.GOVERNANCE_FORUM}/u/${handle}/summary`}
                    isExternal
                    _hover={{
                      textDecoration: 'underline',
                      color: theme.compensation?.card.text,
                    }}
                    color={theme.compensation?.card.secondaryText}
                    fontSize="14px"
                    display="flex"
                    alignItems="center"
                    gap="2"
                  >
                    <Icon as={FaDiscourse} boxSize="16px" />
                    <Text>{handle}</Text>
                    <Icon as={FaExternalLinkAlt} boxSize="12px" ml="auto" />
                  </ChakraLink>
                ))}
              </Flex>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ) : null}
    </Flex>
  );
};
