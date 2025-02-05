import { Flex, Text } from '@chakra-ui/react';
import { useDAO, useDelegates, useEditProfile } from 'contexts';
import { FC, ReactNode } from 'react';
import { ICustomFields } from 'types';
import { EditableSectionItem } from './EditableSectionItem';
import { SectionItem } from './SectionItem';

const SectionHeader: FC<{ children: ReactNode }> = ({ children }) => {
  const { theme } = useDAO();
  return (
    <Text color={theme.modal.statement.sidebar.section} fontWeight="semibold">
      {children}
    </Text>
  );
};

interface ISidebar {
  interests: ICustomFields;
  isEditMode: boolean;
}

export const Sidebar: FC<ISidebar> = ({ interests, isEditMode }) => {
  const {
    isEditing,
    defaultInterests,
    editInterests,
    newInterests,
    editTracks,
    newTracks,
  } = useEditProfile();
  const { tracks, profileSelected } = useDelegates();
  const interestsValueArray = Array.isArray(interests.value)
    ? (interests.value as string[])
    : interests.value.split(',');

  return (
    <Flex flex="1">
      <Flex flexDir="column" gap="10" w="full">
        {profileSelected?.tracks?.length || (isEditing && tracks.length) ? (
          <Flex flexDir="column" gap="5">
            {profileSelected?.tracks?.length || (isEditing && tracks.length) ? (
              <SectionHeader>Tracks</SectionHeader>
            ) : undefined}
            <Flex columnGap="1" rowGap="2" flexWrap="wrap">
              {isEditing
                ? tracks.map((track, index) => (
                    <EditableSectionItem
                      isEditMode={isEditMode}
                      key={+index}
                      value={track.id}
                      label={track.displayName}
                      isSelected={newTracks.includes(track.id)}
                      selectItem={editTracks}
                    />
                  ))
                : profileSelected?.tracks?.map((track, index) => (
                    <SectionItem key={+index} label={track.name} />
                  ))}
            </Flex>
          </Flex>
        ) : null}
        <Flex flexDir="column" gap="5">
          {((interests && interestsValueArray.length > 0) || isEditing) && (
            <SectionHeader>Interests</SectionHeader>
          )}
          <Flex columnGap="1" rowGap="2" flexWrap="wrap">
            {isEditing
              ? defaultInterests.map((interest, index) => (
                  <EditableSectionItem
                    isEditMode={isEditMode}
                    key={+index}
                    value={interest[0].toUpperCase() + interest.substring(1)}
                    isSelected={newInterests.value.includes(interest)}
                    selectItem={editInterests}
                  />
                ))
              : interestsValueArray.map((interest, index) => (
                  <EditableSectionItem
                    isEditMode={isEditMode}
                    key={+index}
                    value={interest[0].toUpperCase() + interest.substring(1)}
                    isSelected={interestsValueArray.includes(interest)}
                    selectItem={() => undefined}
                  />
                ))}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
