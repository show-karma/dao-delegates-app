import { useEffect, useState } from 'react';
import makeBlockie from 'ethereum-blockies-base64';
import { Image, ImgProps } from '@chakra-ui/react';

interface Props extends ImgProps {
  fallback?: string;
}
/**
 * Image component to avoid possible not handled error on image path
 */
export const ImgWithFallback = ({
  fallback = 'Delegate',
  src,
  ...props
}: Props) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [canLoad, setCanLoad] = useState(false);

  const avatarIcon = makeBlockie(fallback);

  const onError = () => {
    setImgSrc(avatarIcon);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCanLoad(true);
    }
  }, []);

  return canLoad ? (
    <Image
      fallbackStrategy="beforeLoadOrError"
      fallbackSrc={avatarIcon}
      src={imgSrc || avatarIcon}
      onError={onError}
      alt=""
      {...props}
    />
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <></>
  );
};
