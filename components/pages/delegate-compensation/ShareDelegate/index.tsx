import {
  Button,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Text,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { FC, useState } from 'react';
import { useDAO } from 'contexts';
import { useRouter } from 'next/router';
import { BsTwitter } from 'react-icons/bs';
import { IoChevronDown } from 'react-icons/io5';

/**
 * ShareDelegate component that provides a dropdown menu to share a delegate's profile
 * on various social media platforms
 */
export const ShareDelegate: FC = () => {
  const { theme, daoInfo } = useDAO();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Get delegate address from URL params if not provided as a prop
  const { query } = useRouter();
  const router = useRouter();
  // Extract delegateAddress from router.query or router.asPath if not available in query
  // This handles both query parameters and route parameters
  const delegateAddressFromUrl =
    (query.delegateAddress as string) ||
    (router.asPath.match(/\/delegate\/([^/?]+)/) || [])[1] ||
    (router.asPath.match(/\/delegate-compensation\/delegate\/([^/?]+)/) ||
      [])[1];

  // Get month and year from URL params if not provided as props
  const monthFromUrl = query.month as string;
  const yearFromUrl = query.year as string;

  // Use month and year from props if provided, otherwise use from URL
  const effectiveMonth = monthFromUrl;
  const effectiveYear = yearFromUrl;

  /**
   * Constructs the API URL for generating the delegate compensation stats image
   * @returns The full URL to the stats image API endpoint
   */
  const getStatsImageUrl = () =>
    `${daoInfo.config.METATAGS.URL}/delegate-compensation/delegate/${delegateAddressFromUrl}?month=${effectiveMonth}&year=${effectiveYear}`;

  /**
   * Handles sharing the delegate profile on Twitter/X
   * Waits for the image to be generated before sharing
   */
  const handleTwitterShare = async () => {
    const monthFirstLetterCapitalized =
      effectiveMonth.charAt(0).toUpperCase() + effectiveMonth.slice(1);
    const statsImageUrl = getStatsImageUrl();
    const tweetText = `📊 Checkout my ${daoInfo.config.DAO} DAO Governance activity for the month of ${monthFirstLetterCapitalized}.\n\n`;

    // Use Twitter Web Intent with the text and URL separated
    // The \n\n in the tweet text creates a line break between text and URL
    const twitterShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&url=${encodeURIComponent(statsImageUrl)}`;

    // Open Twitter share in a new window
    window.open(twitterShareUrl, '_blank');

    toast({
      title: 'Twitter share window opened',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Flex
      flexDir={{ base: 'column', md: 'row' }}
      gap="4"
      color={theme.compensation?.card.text}
      bg={theme.compensation?.card.bg}
      alignItems="center"
      justifyContent="center"
      w={{ base: 'full', md: 'max-content' }}
      p="4"
      borderRadius="8px"
    >
      <Text fontSize="16px" fontWeight="semibold">
        Spread the word, share your impact!{' '}
      </Text>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<Icon as={IoChevronDown} width="20px" height="20px" />}
          isLoading={isLoading}
          bg={theme.branding}
          color={theme.buttonText}
          _hover={{ opacity: 0.75 }}
          _active={{ opacity: 0.75 }}
          borderRadius="8px"
          px="3.5"
          py="2.5"
          fontSize="14px"
          fontWeight="500"
          w={{ base: 'full', md: 'max-content' }}
        >
          Share
        </MenuButton>
        <MenuList
          bg={theme.compensation?.card.dropdown.bg}
          color={theme.compensation?.card.dropdown.text}
          boxShadow="md"
          zIndex={10}
        >
          <MenuItem
            onClick={handleTwitterShare}
            bg={theme.compensation?.card.dropdown.bg}
            color={theme.compensation?.card.dropdown.text}
            _hover={{ bg: theme.compensation?.card.dropdown.bg, opacity: 0.75 }}
          >
            <Box display="flex" alignItems="center">
              <BsTwitter style={{ marginRight: '8px' }} />
              <Text>Share on X</Text>
            </Box>
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};
