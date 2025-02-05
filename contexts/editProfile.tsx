import axios from 'axios';
import { api, API_ROUTES, KARMA_API } from 'helpers';
import { useToasty } from 'hooks';
import { useIsMounted } from 'hooks/useIsMounted';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { ICustomFields } from 'types';
import { useAccount } from 'wagmi';
import { useAuth } from './auth';
import { useDAO } from './dao';
import { useDelegates } from './delegates';
import { useProxy } from './proxy';

interface IEditProfileProps {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setEditSaving: React.Dispatch<React.SetStateAction<boolean>>;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  isEditSaving: boolean;
  saveEdit: () => void;
  statement: ICustomFields;
  languages: ICustomFields;
  interests: ICustomFields;
  newStatement: ICustomFields;
  newInterests: ICustomFields;
  isLoadingStatement: boolean;
  editInterests: (selectedInterest: string) => void;
  defaultInterests: string[];
  editStatementText: (text: string) => void;
  editName: (text: string) => void;
  editProfilePicture: (url: string | null) => void;
  newName: string | null;
  newProfilePicture: string | null;
  changeHandle: (
    newHandle: string,
    media: 'twitter' | 'forum' | 'website' | 'thread'
  ) => Promise<void>;
  acceptedTerms: boolean;
  changeAcceptedTerms: (choice: boolean) => void;
  newToA: string;
  changeToA: (text: string) => void;
  delegateToA: string;
  isLoadingToA: boolean;
  editTracks: (selectedTrack: number) => void;
  newTracks: number[];
}

export const EditProfileContext = createContext({} as IEditProfileProps);

interface ProviderProps {
  children: React.ReactNode;
}

const presetInterests = [
  'Identity',
  'Security',
  'NFT',
  'DAOs',
  'Governance',
  'Legal',
];

export const EditProfileProvider: React.FC<ProviderProps> = ({ children }) => {
  const isMounted = useIsMounted();
  const { isConnected } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditSaving, setEditSaving] = useState(false);
  const [value, setValue] = useState('');
  const [newName, setNewName] = useState<string | null>(null);
  const [newProfilePicture, setNewProfilePicture] = useState<string | null>(
    null
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { toast } = useToasty();
  const {
    profileSelected,
    interests: delegatesInterests,
    refreshProfileModal,
    fetchDelegates,
  } = useDelegates();

  const { daoInfo } = useDAO();
  const { address } = useAccount();
  const { authToken, isAuthenticated, isDaoAdmin, disconnect } = useAuth();
  const { config } = daoInfo;

  const defaultInterests = delegatesInterests.length
    ? delegatesInterests
    : presetInterests;

  const defaultCustomFields: ICustomFields = {
    label: '',
    value: [],
  };

  const [statement, setStatement] =
    useState<ICustomFields>(defaultCustomFields);
  const [languages] = useState<ICustomFields>(defaultCustomFields);
  const [interests, setInterests] =
    useState<ICustomFields>(defaultCustomFields);

  const [delegateToA, setDelegateToA] = useState<string>('');

  const [isLoadingStatement, setIsLoadingStatement] = useState(false);
  const [isLoadingToA, setIsLoadingToA] = useState(false);

  const { compareProxy } = useProxy();

  const [newToA, setNewToA] = useState('');
  const [newTracks, setNewTracks] = useState<number[]>([]);
  const [newInterests, setNewInterests] = useState(defaultCustomFields);
  const [newStatement, setNewStatement] =
    useState<ICustomFields>(defaultCustomFields);

  const queryStatement = async () => {
    if (!profileSelected?.address) return;
    setIsLoadingStatement(true);
    try {
      const { data: offChainStatement } = await api.get(
        `/forum-user/${config.DAO_KARMA_ID}/delegate-pitch/${profileSelected.address}`
      );
      if (!offChainStatement?.data.delegatePitch) return;

      const customFields: ICustomFields[] =
        offChainStatement?.data.delegatePitch?.customFields;
      const emptyField: ICustomFields = { label: '', value: [] };

      let fetchedInterests =
        customFields?.find(
          item =>
            item.label.toLowerCase().includes('interests') ||
            item.displayAs === 'interests'
        ) || emptyField;

      const fetchedStatement =
        customFields?.find(
          (item: {
            value: string | string[];
            label: string;
            displayAs?: string;
          }) =>
            typeof item.value === 'string' &&
            (item.label.includes('statement') ||
              item.displayAs?.includes('headline'))
        ) || emptyField;

      const interestsValue = Array.isArray(fetchedInterests.value)
        ? fetchedInterests.value
        : fetchedInterests.value?.split(',') || [];
      const trimmedMap = interestsValue.map((item: string) => item.trim());
      fetchedInterests = {
        ...fetchedInterests,
        value: trimmedMap,
      };

      setInterests(fetchedInterests);
      setStatement(fetchedStatement);
      setNewInterests(fetchedInterests);
      setNewStatement(fetchedStatement);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.debug(error);
      setInterests(defaultCustomFields);
      setStatement(defaultCustomFields);
      setNewInterests(defaultCustomFields);
      setNewStatement(defaultCustomFields);
    } finally {
      setIsLoadingStatement(false);
    }
  };

  const queryToA = async () => {
    if (!profileSelected?.address) return;
    setIsLoadingToA(true);
    try {
      const { data } = await api.get(
        API_ROUTES.DELEGATE.GET_TERMS_OF_SERVICE(
          config.DAO_KARMA_ID,
          profileSelected.address
        )
      );
      setDelegateToA(data?.data.agreementText);
      setNewToA(data?.data.agreementText);
    } catch (error) {
      const defaultToA = daoInfo.config.DEFAULT_TOA;
      if (defaultToA) {
        setNewToA(defaultToA);
        return;
      }
    } finally {
      setIsLoadingToA(false);
    }
  };

  const changeToA = (newText: string) => {
    setNewToA(newText);
  };

  const editTracks = (selectedTrack: number) => {
    const trackExists = newTracks.includes(selectedTrack);

    if (trackExists) {
      const filtered = newTracks.filter(
        (item: number) => item !== selectedTrack
      );
      setNewTracks(filtered);
    } else {
      setNewTracks(oldArray => [...oldArray, selectedTrack]);
    }
  };

  const editInterests = (selectedInterest: string) => {
    const newInterestsValue = Array.isArray(newInterests.value)
      ? [...newInterests.value]
      : newInterests.value.split(',');
    const findInterest = newInterestsValue.find(
      item => item === selectedInterest
    );

    if (findInterest) {
      const filtered = newInterestsValue.filter(
        (item: string) => item !== selectedInterest
      );
      setNewInterests({
        ...newInterests,
        value: filtered,
        label: 'Interests',
        displayAs: 'interests',
      });
      return;
    }
    newInterestsValue.push(selectedInterest);
    setNewInterests({
      ...newInterests,
      value: newInterestsValue,
      label: 'Interests',
      displayAs: 'interests',
    });
  };

  const sendAcceptedTerms = async () => {
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
      API_ROUTES.DELEGATE.TERMS_OF_SERVICE(daoInfo.config.DAO_KARMA_ID),
      {
        acceptedTOS: acceptedTerms,
      }
    );
  };

  const changeAcceptedTerms = (choice: boolean) => {
    setAcceptedTerms(choice);
  };

  useMemo(() => {
    changeAcceptedTerms(profileSelected?.acceptedTOS ?? false);
  }, [profileSelected?.acceptedTOS]);

  const setupTracks = () => {
    if (profileSelected?.tracks && profileSelected?.tracks.length > 0) {
      const tracksToSetup = profileSelected?.tracks?.map(track => track.id);
      setNewTracks(tracksToSetup);
    }
  };

  useMemo(() => {
    if (profileSelected) {
      queryStatement();
      if (daoInfo.config.DAO_SUPPORTS_TOA) queryToA();
      setNewName(profileSelected.realName || profileSelected.ensName || '');
      setNewProfilePicture(profileSelected.profilePicture || '');
      setupTracks();
    }
  }, [profileSelected]);

  const hasDelegatePitch = async (): Promise<ICustomFields[] | undefined> => {
    try {
      const { data } = await api.get(
        `/forum-user/${config.DAO_KARMA_ID}/delegate-pitch/${profileSelected?.address}`
      );
      return data?.data.delegatePitch;
    } catch (error) {
      return undefined;
    }
  };

  const saveEdit = async () => {
    setIsEditing(true);
    setEditSaving(true);
    const fetchedDelegatePitch = await hasDelegatePitch();
    let hasError = false;
    let actualError = '';

    if (
      newInterests.value !== interests.value ||
      newStatement.value !== statement.value
    ) {
      try {
        const authorizedAPI = axios.create({
          timeout: 30000,
          baseURL: KARMA_API.base_url,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
        });
        if (fetchedDelegatePitch) {
          await authorizedAPI.put(
            `${KARMA_API.base_url}/forum-user/${daoInfo.config.DAO_KARMA_ID}/delegate-pitch/${profileSelected?.address}`,
            {
              customFields: [newInterests, newStatement],
            }
          );
        } else if (newInterests.value || newStatement) {
          await authorizedAPI.post(
            `${KARMA_API.base_url}/forum-user/${daoInfo.config.DAO_KARMA_ID}/delegate-pitch/${profileSelected?.address}`,
            {
              customFields: [
                {
                  label: 'Interests',
                  value: newInterests.value,
                  displayAs: 'interests',
                },
                newStatement,
              ],
            }
          );
        }
        // subgrpah refresh time (not always work).
        // The new profile data should be replaced with the local
        // data instead of fetching again.
        await queryStatement();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        hasError = true;
        actualError = error.response.data.error.message;
      }
    }

    const tracksMap = profileSelected?.tracks?.map(
      (track: { id: number }) => track.id
    );
    if (
      tracksMap !== newTracks &&
      daoInfo.config.DAO_CATEGORIES_TYPE === 'tracks' &&
      profileSelected?.address
    ) {
      try {
        const authorizedAPI = axios.create({
          timeout: 30000,
          baseURL: KARMA_API.base_url,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
        });

        await authorizedAPI.post(
          API_ROUTES.DELEGATE.CHANGE_TRACKS(
            daoInfo.config.DAO_KARMA_ID,
            profileSelected?.address
          ),
          {
            tracks: newTracks,
          }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        hasError = true;
        actualError = error.response.data.error.message;
      }
    }

    if (daoInfo.config.DAO_SUPPORTS_TOA) {
      if (newToA !== delegateToA && profileSelected?.address) {
        try {
          const authorizedAPI = axios.create({
            timeout: 30000,
            baseURL: KARMA_API.base_url,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: authToken ? `Bearer ${authToken}` : '',
            },
          });
          if (delegateToA.length > 0) {
            await authorizedAPI.put(
              API_ROUTES.DELEGATE.TERMS_OF_AGREEMENT(
                daoInfo.config.DAO_KARMA_ID
              ),
              {
                agreementText: newToA,
              }
            );
          } else if (newToA.length > 0) {
            await authorizedAPI.post(
              API_ROUTES.DELEGATE.TERMS_OF_AGREEMENT(
                daoInfo.config.DAO_KARMA_ID
              ),
              {
                agreementText: newToA,
              }
            );
          }
          await queryToA();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          hasError = true;
          actualError = error.response.data.error.message;
        }
      }
    }

    if (
      daoInfo.config.DAO_SUPPORTS_TOS &&
      acceptedTerms !== profileSelected?.acceptedTOS
    ) {
      try {
        await sendAcceptedTerms();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        hasError = true;
        actualError = error.response.data.error.message;
      }
    }

    if (
      profileSelected?.address !== newName ||
      profileSelected?.profilePicture !== newProfilePicture
    ) {
      try {
        const authorizedAPI = axios.create({
          timeout: 30000,
          baseURL: KARMA_API.base_url,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
        });
        if (!profileSelected) return;

        const handleField = (
          constant: string | null,
          originalConstant?: string
        ) => {
          if (constant === null) return null;
          if (constant === originalConstant) return undefined;
          if (constant) return constant;
          return undefined;
        };

        await authorizedAPI.put(
          `${KARMA_API.base_url}/user/${config.DAO_KARMA_ID}/${profileSelected.address}`,
          {
            name: handleField(
              newName,
              profileSelected.realName || profileSelected.ensName || ''
            ),
            profilePicture: handleField(
              newProfilePicture,
              profileSelected?.profilePicture
            ),
          }
        );
        refreshProfileModal();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        hasError = true;
        actualError = error.response.data.error.message;
      } finally {
        setEditSaving(false);
        setIsEditing(false);
      }
    }

    if (hasError) {
      toast({
        title: 'We could not save your profile. Please try again.',
        description: actualError,
        status: 'error',
      });
    } else {
      toast({
        description: 'Your profile has been saved',
        status: 'success',
      });
    }
  };

  const changeHandle = async (
    newHandle: string,
    media: 'twitter' | 'forum' | 'website' | 'thread'
  ) => {
    try {
      const authorizedAPI = axios.create({
        timeout: 30000,
        baseURL: KARMA_API.base_url,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
      });

      if (media === 'website') {
        await authorizedAPI
          .put(
            `${KARMA_API.base_url}/user/${config.DAO_KARMA_ID}/${profileSelected?.address}`,
            {
              website: newHandle,
            }
          )
          .then(() => {
            refreshProfileModal();
            fetchDelegates(0);
          });
      } else if (media === 'thread') {
        await authorizedAPI
          .put(
            `${KARMA_API.base_url}/delegate/${config.DAO_KARMA_ID}/discussion-thread`,
            {
              discussionThread: newHandle,
            }
          )
          .then(() => {
            refreshProfileModal();
            fetchDelegates(0);
          });
      } else {
        const bodyParam =
          media === 'twitter' || media === 'forum' ? `${media}Handle` : media;
        await authorizedAPI
          .put(
            `${KARMA_API.base_url}/user/${daoInfo.config.DAO_KARMA_ID}/handles/${profileSelected?.address}`,
            {
              [bodyParam]: newHandle,
            }
          )
          .then(() => {
            refreshProfileModal();
            fetchDelegates(0);
          });
      }
      toast({
        description: `${
          media.charAt(0).toUpperCase() + media.slice(1)
        } has been saved`,
        status: 'success',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.data?.error?.message)
        toast({
          status: 'error',
          description: error.response.data.error.message,
        });
    }
  };

  useMemo(() => {
    setIsEditing(false);
    if (
      (profileSelected &&
        compareProxy(profileSelected.address) &&
        isConnected &&
        isAuthenticated) ||
      isDaoAdmin
    ) {
      setIsEditing(true);
    }
  }, [address]);

  const editStatementText = (text: string) => {
    if (newStatement.value) {
      setNewStatement({
        ...newStatement,
        value: text || [],
      });
    }
    setNewStatement({
      label: 'statement',
      displayAs: 'headline',
      value: text || [],
    });
  };

  const editName = (text: string) => {
    if (text === '') {
      setNewName(null);
      return;
    }
    setNewName(text);
  };

  const editProfilePicture = (url: string | null) => {
    setNewProfilePicture(url);
  };

  const providerValue = useMemo(
    () => ({
      isEditing,
      setIsEditing,
      value,
      setValue,
      isEditSaving,
      setEditSaving,
      saveEdit,
      statement,
      languages,
      interests,
      isLoadingStatement,
      defaultInterests,
      editInterests,
      newStatement,
      newInterests,
      editStatementText,
      newName,
      editName,
      newProfilePicture,
      editProfilePicture,
      changeHandle,
      changeAcceptedTerms,
      acceptedTerms,
      changeToA,
      newToA,
      delegateToA,
      isLoadingToA,
      editTracks,
      newTracks,
    }),
    [
      isEditing,
      setIsEditing,
      value,
      setValue,
      isEditSaving,
      setEditSaving,
      statement,
      languages,
      interests,
      isLoadingStatement,
      editInterests,
      defaultInterests,
      newStatement,
      newInterests,
      editStatementText,
      newName,
      editName,
      newProfilePicture,
      editProfilePicture,
      changeHandle,
      changeAcceptedTerms,
      acceptedTerms,
      changeToA,
      newToA,
      delegateToA,
      isLoadingToA,
      editTracks,
      newTracks,
    ]
  );

  return isMounted ? (
    <EditProfileContext.Provider value={providerValue}>
      {children}
    </EditProfileContext.Provider>
  ) : null;
};

export const useEditProfile = () => useContext(EditProfileContext);
