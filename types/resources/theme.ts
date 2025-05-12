export interface IDAOTheme {
  logo?: string;
  isLogoRounded?: boolean;
  background: string;
  brandingImageColor?: string;
  secondBg?: string;
  bodyBg: string;
  bodyShadow?: string;
  title: string;
  stroke?: string;
  subtitle: string;
  text: string;
  branding: string;
  buttonText: string;
  buttonTextSec: string;
  headerBg: string;
  gradientBall: string;
  themeIcon: string;
  secondaryButton?: {
    bg: string;
    text: string;
  };
  compensation?: {
    bg: string;
    modal: {
      block: string;
      emphasis: string;
      emphasisBg: string;
      blockText: string;
      text: string;
      closeBtn: string;
      closeBtnBg: string;
    };
    card: {
      bg: string;
      text: string;
      secondaryText: string;
      success: string;
      error: string;
      link: string;
      divider: string;
      input: {
        bg: string;
        text: string;
      };
      dropdown: {
        bg: string;
        text: string;
        border: string;
      };
    };
    icons: {
      snapshot: string;
      onchain: string;
      delegateFeedback: string;
      rationale: string;
      bonusPoint: string;
      participationRate: string;
      finalScore: string;
      penaltyYes?: string;
      penaltyNo?: string;
    };
    performanceOverview: {
      header: {
        text: string;
        bg: {
          optedIn: string;
          greaterThan50kVP: string;
          averageParticipationRate: string;
          averageVotingPower: string;
          discord: string;
          scoringSystem: string;
          card: string;
        };
      };
    };
  };
  collapse: {
    bg?: string;
    text: string;
    subtext: string;
  };
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
    activeBg?: string;
    listText: string;
    shadow?: string;
  };
  card: {
    shadow?: string;
    icon: string;
    background: string;
    statBg: string;
    divider: string;
    text: {
      primary: string;
      secondary: string;
    };
    workstream: { bg: string; text: string };
    interests: { bg: string; text: string };
    border: string;
    common: string;
    socialMedia: string;
  };
  modal: {
    background: string;
    header: {
      border: string;
      title: string;
      subtitle: string;
      twitter: string;
      divider: string;
      hoverText?: string;
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
      modules?: {
        chart: {
          point: string;
          openGradient: string;
          endGradient: string;
        };
      };
      proposal: {
        title: string;
        type: string;
        date: string;
        result: string;
        verticalDivider: string;
        divider: string;
        bg: string;
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
    delegateTo: {
      bg: string;
      userBg: string;
      userShadow: string;
      topBg: string;
      text: string;
      subtext: string;
      input: {
        placeholder: string;
        text: string;
        dirtyBorder: string;
        border: string;
        error: string;
        bg: string;
      };
      button: {
        disabled: {
          bg: string;
          text: string;
        };
        normal: {
          bg: string;
          text: string;
        };
        alternative: {
          bg: string;
          text: string;
          border: string;
        };
      };
    };
  };
  loginModal: {
    logo?: string;
    background: string;
    text: string;
    footer: {
      bg: string;
      text: string;
    };
    button: {
      bg: string;
      text: string;
    };
  };
  tokenHolders: {
    border: string;
    bg: string;
    stepsColor: string;
    list: {
      text: {
        primary: string;
        secondary: string;
      };
      bg: {
        primary: string;
        secondary: string;
      };
    };
    delegations: {
      accordion: {
        button: {
          border: string;
          text: string;
          icon: string;
        };
      };
      border: {
        input: '#88939F';
      };
      input: {
        pillText: string;
        pillBg: string;
      };
      text: {
        primary: string;
        secondary: string;
        button: string;
        input: { placeholder: string; text: string };
      };
      card: {
        header: {
          text: string;
          pillText: string;
          pillBg: string;
        };
        legend: {
          text: string;
          bg: string;
          pillText: string;
          pillBg: string;
        };
        columns: {
          text: string;
          icon: {
            bg: string;
            text: string;
          };
          stats: {
            primary: string;
            secondary: string;
            border: string;
            leftBorder: string;
          };
          voting: {
            total: string;
            totalNumber: string;
            proposals: {
              title: string;
              hyperlink: string;
              description: string;
              sort: {
                label: string;
                bg: string;
                border: string;
                text: string;
              };
              vote: {
                iconBg: string;
                text: string;
                divider: string;
                reason: { title: string; text: string };
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
            input: {
              placeholder: string;
              icon: string;
              border: string;
              text: string;
            };
          };
        };
      };
      bg: {
        primary: string;
        secondary: string;
        tertiary: string;
      };
    };
  };
}
