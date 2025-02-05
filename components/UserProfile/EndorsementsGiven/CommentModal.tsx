import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { FC, useRef } from 'react';

interface CommentModalProps {
  reason: string;
}

export const CommentModal: FC<CommentModalProps> = ({ reason }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  return (
    <>
      <Button
        color="white"
        bg="transparent"
        onClick={onOpen}
        _hover={{ opacity: 0.8 }}
        _active={{ opacity: 0.8 }}
        _focus={{ opacity: 0.8 }}
        _focusVisible={{ opacity: 0.8 }}
        _focusWithin={{ opacity: 0.8 }}
        textDecoration="underline"
      >
        Comment
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent maxH="520px" bg="gray.900">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Comment
            </AlertDialogHeader>

            <AlertDialogBody maxH="520px" overflowY="auto">
              {reason}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Close
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
