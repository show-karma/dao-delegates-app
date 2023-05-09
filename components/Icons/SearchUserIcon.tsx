import { Icon, IconProps } from '@chakra-ui/react';

export const SearchUserIcon = (props: IconProps & { iconBg: string }) => {
  const { iconBg } = props;
  return (
    <Icon {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="16" fill={iconBg} />
        <g clipPath="url(#clip0_455_3773)">
          <path
            d="M15.4412 14.8419C16.4069 14.8419 17.1927 14.0562 17.1927 13.0904C17.1927 12.1247 16.4069 11.3389 15.4412 11.3389C14.4754 11.3389 13.6897 12.1247 13.6897 13.0904C13.6897 14.0562 14.4754 14.8419 15.4412 14.8419ZM15.4412 12.3389C15.8555 12.3389 16.1927 12.6761 16.1927 13.0905C16.1927 13.5048 15.8555 13.842 15.4412 13.842C15.0268 13.842 14.6897 13.5048 14.6897 13.0905C14.6897 12.6761 15.0268 12.3389 15.4412 12.3389ZM17.1511 15.3617H13.7312C12.7596 15.3617 11.9691 16.1522 11.9691 17.1238V19.0119C11.9691 19.2881 12.1929 19.5119 12.4691 19.5119H18.4132C18.6894 19.5119 18.9132 19.2881 18.9132 19.0119V17.1238C18.9132 16.1522 18.1228 15.3617 17.1511 15.3617ZM17.9132 18.5119H12.9691V17.1238C12.9691 16.7036 13.3109 16.3617 13.7312 16.3617H17.1511C17.5714 16.3617 17.9133 16.7035 17.9133 17.1238V18.5119H17.9132ZM23.8383 23.1464L21.0188 20.327C22.2136 18.9712 22.8667 17.2486 22.8667 15.4255C22.8667 13.442 22.0943 11.5773 20.6918 10.1748C19.2893 8.77235 17.4246 7.99994 15.4411 7.99994C13.4577 7.99994 11.593 8.77235 10.1905 10.1748C8.78803 11.5773 8.01562 13.442 8.01562 15.4255C8.01562 17.4089 8.78803 19.2736 10.1905 20.6761C11.593 22.0786 13.4577 22.851 15.4411 22.851C17.2496 22.851 18.9592 22.2086 20.3098 21.0322L23.1312 23.8535C23.2288 23.9512 23.3568 24 23.4847 24C23.6126 24 23.7406 23.9512 23.8382 23.8535C24.0335 23.6582 24.0335 23.3417 23.8383 23.1464ZM10.8977 19.969C9.68403 18.7553 9.01566 17.1418 9.01566 15.4254C9.01566 13.7091 9.68403 12.0956 10.8977 10.8819C12.1113 9.66831 13.7248 8.99994 15.4411 8.99994C17.1575 8.99994 18.771 9.66831 19.9847 10.8819C21.1983 12.0956 21.8667 13.7092 21.8667 15.4255C21.8667 17.1418 21.1983 18.7554 19.9847 19.969C17.4794 22.4743 13.403 22.4743 10.8977 19.969Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <clipPath id="clip0_455_3773">
            <rect
              width="32"
              height="16"
              fill="white"
              transform="translate(0 8)"
            />
          </clipPath>
        </defs>
      </svg>
    </Icon>
  );
};
