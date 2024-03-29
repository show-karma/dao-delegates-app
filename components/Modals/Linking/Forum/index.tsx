import { ModalContent, ModalOverlay, Modal } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { AxiosClient } from 'helpers';
import { useToasty } from 'hooks';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { ESteps } from './ESteps';

const Step1 = dynamic(() => import('./Step1').then(module => module.Step1));
const Step2 = dynamic(() => import('./Step2').then(module => module.Step2));
const Step3 = dynamic(() => import('./Step3').then(module => module.Step3));
const StepVerified = dynamic(() =>
  import('./StepVerified').then(module => module.StepVerified)
);

interface IModal {
  open: boolean;
  handleModal: () => void;
  onClose: () => void;
}

export const DiscourseModal: React.FC<IModal> = ({
  open,
  onClose,
  handleModal,
}) => {
  const [step, setStep] = useState(ESteps.INPUT);
  const [signature, setSignature] = useState('');
  const [username, setUsername] = useState('');
  const { toast, updateState } = useToasty();
  const { address } = useAccount();
  const { daoData, daoInfo } = useDAO();
  const daoName = daoData?.name || '';
  const logoUrl = daoData?.socialLinks.logoUrl || '';
  const forumTopicURL = daoData?.forumTopicURL || '';
  const publicAddress = address || '';
  const request = AxiosClient();

  const validationPromise = () =>
    new Promise((resolve, reject) =>
      // eslint-disable-next-line no-promise-executor-return
      request
        .post('/dao/link/forum', {
          daoName,
          message: username.toLowerCase(),
          address,
        })
        .then(() => {
          setStep(ESteps.VERIFIED);
          updateState({
            title: 'Verified.',
            description:
              'Your forum handle has been verified and linked to your profile!',
            status: 'success',
            duration: 10000,
          });
          return resolve(true);
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((error: any) => {
          setStep(ESteps.PUBLISH);
          const errorMessage = error?.response?.data;
          if (!errorMessage) return reject(error);
          updateState({
            title: 'Forum verification failed',
            description: errorMessage?.error,
            status: 'error',
            duration: 10000,
          });
          return reject(error);
        })
    );

  const verifyPublication = async () => {
    setStep(ESteps.VERIFYING);
    try {
      toast({
        title: 'Verifying your publication',
        description: 'Please wait while we verify your publication.',
        duration: 100000,
        status: 'info',
      });
      validationPromise();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  const resetStep = () => setStep(ESteps.INPUT);

  const closeModal = () => {
    handleModal();
    resetStep();
  };

  const renderStep = () => {
    if (step === ESteps.SIGN)
      return (
        <Step2
          handleModal={closeModal}
          setStep={setStep}
          username={username}
          setSignature={setSignature}
          daoInfo={{ name: daoName, logoUrl }}
        />
      );
    if (
      step === ESteps.PUBLISH ||
      step === ESteps.VERIFICATION ||
      step === ESteps.VERIFYING
    )
      return (
        <Step3
          handleModal={closeModal}
          setStep={setStep}
          signature={signature}
          daoForumTopic={forumTopicURL}
          publicAddress={publicAddress}
          daoName={daoName}
          step={step}
          verifyPublication={verifyPublication}
        />
      );
    if (step === ESteps.VERIFIED)
      return (
        <StepVerified
          handleModal={closeModal}
          username={username}
          daoInfo={{ name: daoName, logoUrl }}
        />
      );
    return (
      <Step1
        handleModal={closeModal}
        setStep={setStep}
        username={username}
        setUsername={setUsername}
        daoInfo={{ name: daoName, logoUrl }}
      />
    );
  };
  // TODO enable when twitter come back

  // const notShowCondition =
  //   daoInfo.config.SHOULD_NOT_SHOW === 'handles' ||
  //   !profileSelected?.userCreatedAt ||
  //   (daoInfo.config.DAO_KARMA_ID === 'starknet' &&
  //     !!profileSelected?.userCreatedAt &&
  //     lessThanDays(profileSelected?.userCreatedAt, 100));

  const notShowCondition = daoInfo.config.SHOULD_NOT_SHOW === 'handles';

  useEffect(() => {
    if (notShowCondition) {
      onClose();
    }
  }, [open]);

  useMemo(() => {
    if (!daoData?.forumTopicURL) closeModal();
  }, [daoData]);

  return (
    <Modal
      isOpen={open}
      onClose={closeModal}
      aria-labelledby="forum-modal-title"
      aria-describedby="forum-modal-description"
    >
      <ModalOverlay />
      <ModalContent>{renderStep()}</ModalContent>
    </Modal>
  );
};
