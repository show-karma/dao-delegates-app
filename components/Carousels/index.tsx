/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
/* eslint-disable jsx-a11y/control-has-associated-label */
// Carousel.tsx
import { Flex, FlexProps } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import React, { CSSProperties } from 'react';
import { useSnapCarousel } from 'react-snap-carousel';

const hideScrollbarStyles: any = {
  msOverflowStyle: 'none', // IE and Edge
  scrollbarWidth: 'none', // Firefox
  '&::WebkitScrollbar': {
    display: 'none', // Chrome, Safari and Opera
  },
  '&::-webkit-scrollbar': {
    display: 'none', // Chrome, Safari and Opera
  },
};

const styles: Record<string, CSSProperties> = {
  root: {
    height: '100%',
    width: '100%',
  },
  scroll: {
    position: 'relative',
    display: 'flex',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollSnapType: 'x mandatory',
  },
  item: {
    flexShrink: 0,
    listStyle: 'none',
  },
  itemSnapPoint: {
    scrollSnapAlign: 'start',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextPrevButton: {},
  nextPrevButtonDisabled: { opacity: 0.3 },
  pagination: {
    display: 'flex',
  },
  paginationButton: {
    margin: '6px 6px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#98A2B3',
  },
  paginationButtonActive: {
    background: '#2E90FA',
    width: '30px',
    borderRadius: '12px',
  },
  pageIndicator: {
    display: 'flex',
    justifyContent: 'center',
  },
};

interface CarouselRenderItemProps<T> {
  readonly item: T;
  readonly isSnapPoint: boolean;
}
interface CarouselItemProps {
  readonly isSnapPoint: boolean;
  readonly children?: React.ReactNode;
  flexProps?: FlexProps;
}
interface CarouselProps<T> {
  readonly items: T[];
  readonly renderItem: (
    props: CarouselRenderItemProps<T>
  ) => React.ReactElement<CarouselItemProps>;
  controlStyle?: CSSProperties;
}

export const Carousel = <T extends any>({
  items,
  renderItem,
  controlStyle,
}: CarouselProps<T>) => {
  const {
    scrollRef,
    pages,
    activePageIndex,
    hasPrevPage,
    hasNextPage,
    prev,
    next,
    goTo,
    snapPointIndexes,
  } = useSnapCarousel();
  const { theme } = useDAO();
  return (
    <div style={styles.root}>
      <ul style={{ ...styles.scroll, ...hideScrollbarStyles }} ref={scrollRef}>
        {items.map((item, index) =>
          renderItem({
            item,
            isSnapPoint: snapPointIndexes.has(index),
          })
        )}
      </ul>
      <div style={{ ...styles.controls, ...controlStyle }} aria-hidden>
        {pages.map((_, pageIndex) => (
          <button
            type="button"
            key={pageIndex}
            style={{
              ...styles.paginationButton,
              ...(activePageIndex === pageIndex
                ? styles.paginationButtonActive
                : {}),
              ...(activePageIndex === pageIndex
                ? {
                    background: theme.brandingImageColor || theme.branding,
                  }
                : {}),
            }}
            onClick={() => goTo(pageIndex)}
          />
        ))}
      </div>
    </div>
  );
};

export const CarouselItem = ({
  isSnapPoint,
  children,
  flexProps,
}: CarouselItemProps) => (
  <Flex
    style={{
      ...styles.item,
      ...(isSnapPoint ? styles.itemSnapPoint : {}),
    }}
    {...flexProps}
  >
    {children}
  </Flex>
);

export interface ItemCarouselProps {
  items: { id: string; component: React.ReactNode }[];
  controlStyle?: CSSProperties;
}

export const HeaderCarousel = ({ items, controlStyle }: ItemCarouselProps) => (
  <Carousel
    items={items}
    controlStyle={controlStyle}
    renderItem={({ item, isSnapPoint }) => (
      <CarouselItem
        key={item.id}
        isSnapPoint={isSnapPoint}
        flexProps={{
          minWidth: ['260px', '224px'],
          width: ['max-content'],
          height: ['160px', '210px'],
        }}
      >
        {item.component}
      </CarouselItem>
    )}
  />
);

export const ScoringSystemCarousel = ({
  items,
  controlStyle,
}: ItemCarouselProps) => (
  <Carousel
    items={items}
    controlStyle={controlStyle}
    renderItem={({ item, isSnapPoint }) => (
      <CarouselItem
        key={item.id}
        isSnapPoint={isSnapPoint}
        flexProps={{
          width: ['full'],
          height: ['310px'],
        }}
      >
        {item.component}
      </CarouselItem>
    )}
  />
);
