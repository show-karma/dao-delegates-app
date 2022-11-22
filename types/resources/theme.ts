export interface IDAOTheme {
  background: string;
  bodyBg: string;
  bodyShadow?: string;
  title: string;
  subtitle: string;
  text: string;
  branding: string;
  buttonText: string;
  buttonTextSec: string;
  headerBg: string;
  gradientBall: string;
  themeIcon: string;
  hat: {
    text: {
      primary: string;
      secondary: string;
      madeBy: string;
      lastUpdated: string;
    };
  };
  filters: {
    head: string;
    border: string;
    title: string;
    bg: string;
    listBg: string;
    listText: string;
    shadow?: string;
  };
  card: {
    shadow?: string;
    icon: string;
    background: string;
    featureStatBg: string;
    divider: string;
    text: {
      primary: string;
      secondary: string;
    };
    border: string;
    common: string;
  };
  modal: {
    background: string;
    header: {
      border: string;
      title: string;
      subtitle: string;
      twitter: string;
      divider: string;
    };
    buttons: {
      selectBg: string;
      selectText: string;
      navBg: string;
      navText: string;
      navUnselectedText: string;
      navBorder: string;
    };
    statement: {
      headline: string;
      text: string;
      sidebar: {
        section: string;
        subsection: string;
        text: string;
        item: {
          bg: string;
          text: string;
          border: string;
        };
      };
    };
    votingHistory: {
      headline: string;
      divider: string;
      proposal: {
        title: string;
        type: string;
        date: string;
        result: string;
        verticalDivider: string;
        divider: string;
        icons: {
          for: string;
          against: string;
          abstain: string;
          notVoted: string;
          multiple: string;
        };
      };
      reason: {
        title: string;
        text: string;
        divider: string;
      };
      navigation: {
        color: string;
        buttons: {
          selectedBg: string;
          selectedText: string;
          unSelectedBg: string;
          unSelectedText: string;
        };
      };
    };
  };
}
