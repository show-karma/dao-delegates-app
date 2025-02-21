import { Flex, Spinner } from '@chakra-ui/react';
import { useVersionedComponents } from 'hooks/useVersionedComponents';
import { ComponentType } from 'react';

interface Props<T> {
  component: 'AdminDelegates' | 'AdminForumActivity' | 'AdminHome';
  componentProps: T;
}

export const VersionHandler = <T extends object>({
  component,
  componentProps,
}: Props<T>) => {
  const { components, isLoading } = useVersionedComponents();

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" w="full" h="full">
        <Spinner w="32px" h="32px" />
      </Flex>
    );
  }

  const Component = components[component] as ComponentType<T>;
  return <Component {...componentProps} />;
};
