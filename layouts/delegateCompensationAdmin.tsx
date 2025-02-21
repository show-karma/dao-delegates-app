import { Flex, Heading, Image } from '@chakra-ui/react';
import { ChakraLink } from 'components';
import { AdminGuard } from 'components/pages/delegate-compensation/v1.5/Admin/AdminGuard';
import { useDAO } from 'contexts';
import { useRouter } from 'next/router';

export const DelegateCompensationAdminLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { theme } = useDAO();
  const { pathname } = useRouter();

  const isPublic = !!pathname.includes('/admin');

  return (
    <AdminGuard disableGuard={!isPublic}>
      <Flex flexDir="column" w="full" p={5}>
        {isPublic ? (
          <Flex
            flexDirection={['column', 'row']}
            justifyContent="space-between"
            gap={['4', '10']}
            mb={{ base: 4, md: 0 }}
          >
            <Heading
              mb={{ base: 0, md: 10 }}
              color={theme.text}
              fontSize="32px"
            >
              <Flex flexDir="row" gap="6">
                <Image
                  src="/icons/delegate-compensation/hi.png"
                  alt="hi"
                  w="40px"
                  h="40px"
                />
                Hi, Admin!
              </Flex>
            </Heading>
            <Flex flexDir="row" gap={2} rounded="lg" h="max-content">
              <ChakraLink
                px="2.5"
                py="2.5"
                bgColor="transparent"
                href="/delegate-compensation/admin"
                color={theme.text}
                h="max-content"
                _hover={{}}
                style={{
                  borderBottom: '2px solid',
                  borderBottomColor: !pathname.includes(
                    '/delegate-compensation/admin/delegate'
                  )
                    ? '#155EEF'
                    : 'transparent',
                  fontWeight: !pathname.includes(
                    '/delegate-compensation/admin/delegate'
                  )
                    ? 'bold'
                    : 'normal',
                }}
              >
                Proposals
              </ChakraLink>
              <ChakraLink
                px="2.5"
                py="2.5"
                bgColor="transparent"
                href="/delegate-compensation/admin/delegate"
                color={theme.text}
                h="max-content"
                _hover={{}}
                style={{
                  borderBottom: '2px solid',
                  borderBottomColor: pathname.includes(
                    '/delegate-compensation/admin/delegate'
                  )
                    ? '#155EEF'
                    : 'transparent',
                  fontWeight: pathname.includes(
                    '/delegate-compensation/admin/delegate'
                  )
                    ? 'bold'
                    : 'normal',
                }}
              >
                Delegates
              </ChakraLink>
            </Flex>
          </Flex>
        ) : null}
        {children}
      </Flex>
    </AdminGuard>
  );
};
