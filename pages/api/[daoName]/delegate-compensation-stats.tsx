import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { DelegateStatsFromAPI } from 'types';
import { truncateAddress } from 'utils/truncateAddress';
import { formatNumber, formatSimpleNumber } from 'utils/formatNumber';
import { getPRBreakdown } from 'utils/delegate-compensation/getPRBreakdown';
import pluralize from 'pluralize';
import { blo } from 'blo';
import { getProposals } from 'utils/delegate-compensation/getProposals';
import { compensation } from 'utils/compensation';

export const config = {
  runtime: 'experimental-edge',
};

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract daoName from the URL path segments since NextRequest doesn't have query property
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const daoName = pathSegments[2]; // [0]='', [1]='api', [2]='[daoName]', etc.

    // Get data from query params
    const delegateAddress = searchParams.get('address');
    let month =
      searchParams.get('month') ||
      new Date().toLocaleString('default', { month: 'long' });
    const year =
      searchParams.get('year') || new Date().getFullYear().toString();

    month = (new Date(`${year}-${month}-10`).getMonth() + 1).toString();

    if (!delegateAddress) {
      return new Response(`Delegate address is required`, {
        status: 400,
      });
    }

    // Prefetch fonts in parallel with API calls
    const fontPromises = [
      fetch(
        new URL('./assets/fonts/Inter_Light.ttf', import.meta.url).toString()
      ).then(res => res.arrayBuffer()),
      fetch(
        new URL('./assets/fonts/Inter_Regular.ttf', import.meta.url).toString()
      ).then(res => res.arrayBuffer()),
      fetch(
        new URL('./assets/fonts/Inter_Medium.ttf', import.meta.url).toString()
      ).then(res => res.arrayBuffer()),
      fetch(
        new URL('./assets/fonts/Inter_SemiBold.ttf', import.meta.url).toString()
      ).then(res => res.arrayBuffer()),
      fetch(
        new URL('./assets/fonts/Inter_Bold.ttf', import.meta.url).toString()
      ).then(res => res.arrayBuffer()),
    ];

    // Create all API requests in parallel
    const [delegateStatsResponse, prBreakdown, proposals, ...fontData] =
      await Promise.all([
        // Fetch delegate stats
        (async () => {
          const apiUrl = new URL(
            `/api/delegate/${daoName}/incentive-programs-stats`,
            process.env.NEXT_PUBLIC_KARMA_API
          );
          apiUrl.searchParams.append('month', month);
          apiUrl.searchParams.append('year', year);
          apiUrl.searchParams.append('addresses', delegateAddress);

          const response = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          return response.json();
        })(),

        // Fetch PR breakdown
        getPRBreakdown(delegateAddress, daoName, month, year),

        // Fetch proposals
        getProposals(daoName, month, year),

        // Prefetch fonts
        ...fontPromises,
      ]);

    // Process delegate stats
    const delegateStats = delegateStatsResponse.data
      .delegates[0] as DelegateStatsFromAPI;
    if (!delegateStats) {
      return new Response(`Delegate not found`, {
        status: 404,
      });
    }

    // Check PR breakdown
    if (!prBreakdown) {
      return new Response(`Delegate not found`, {
        status: 404,
      });
    }

    // Process proposals data
    const isScoreFinalized = proposals.finished;

    // Create a formatting helper to avoid redundant formatting calls
    const formatValue = (
      value: number | string | undefined,
      defaultValue = '-'
    ) => {
      if (value === undefined || value === null) return defaultValue;
      if (value === 0 || value === '0') return '0';
      return formatSimpleNumber(value) || defaultValue;
    };

    // Extract stats data once to avoid repeated property access
    const delegateStatsData = delegateStats.stats;
    const snapshotVoting = delegateStatsData.snapshotVoting || {};
    const onChainVoting = delegateStatsData.onChainVoting || {};

    // Define the stats type to include optional properties
    type StatsType = {
      snapshotStats: {
        score: string;
        tn: string;
        rn: string;
      };
      onchainStats: {
        score: string;
        tn: string;
        rn: string;
      };
      participationRate: {
        score: string;
        tn: string;
        rn: string;
      };
      delegateFeedback: string;
      bonusPoints: string;
      finalScore: string;
      communicationRationale?: string;
      averageVotingPower?: string;
    };

    // Stats data - build directly with conditional logic to avoid object spread operations
    const stats: StatsType = {
      snapshotStats: {
        score: formatValue(snapshotVoting.score),
        tn: snapshotVoting.tn || '-',
        rn: snapshotVoting.rn || '-',
      },
      onchainStats: {
        score: formatValue(onChainVoting.score),
        tn: onChainVoting.tn || '-',
        rn: onChainVoting.rn || '-',
      },
      participationRate: {
        score: isScoreFinalized
          ? formatValue(delegateStatsData.participationRate)
          : '-',
        tn: isScoreFinalized
          ? formatValue(prBreakdown?.proposals?.length)
          : '-',
        rn: isScoreFinalized ? formatValue(prBreakdown?.votes?.length) : '-',
      },
      delegateFeedback: isScoreFinalized
        ? formatValue(delegateStatsData.delegateFeedback?.finalScore)
        : '-',
      bonusPoints: isScoreFinalized
        ? formatValue(delegateStatsData.bonusPoint)
        : '-',
      finalScore: isScoreFinalized
        ? formatValue(delegateStatsData.totalParticipation)
        : '-',
    };

    // Process compensation configuration
    const compensationConfigs =
      compensation.compensationDates[daoName.toLowerCase()];
    const selectedDate = new Date(`${year}-${month}-11`);

    // Find the applicable version for the selected date
    const applicableVersion = compensationConfigs?.versions.find(version => {
      const startDate = new Date(version.startDate);
      const endDate = version.endDate ? new Date(version.endDate) : new Date();
      return selectedDate >= startDate && selectedDate <= endDate;
    });

    // Add version-specific stats
    const isOldVersion =
      applicableVersion?.versionNumber &&
      applicableVersion.versionNumber <= 1.5;

    if (isOldVersion) {
      stats.communicationRationale = isScoreFinalized
        ? formatValue(delegateStatsData.communicatingRationale?.score)
        : '-';
    } else {
      stats.averageVotingPower = isScoreFinalized
        ? formatNumber(delegateStatsData.votingPowerAverage || 0) || '-'
        : '-';
    }

    // Avatar URL (with fallback) - compute only once
    const avatarUrl =
      delegateStats.profilePicture ||
      blo(delegateStats.publicAddress as `0x${string}`) ||
      '';

    const delegateName =
      delegateStats.name ||
      delegateStats.ensName ||
      delegateStats.publicAddress;

    // Use SVG for Snapshot icon if possible for better quality
    const BASE_URL = `https://${daoName}.karmahq.xyz`;

    // Create a URL builder function to avoid repetition and enable easier caching
    const getIconUrl = (path: string) => `${BASE_URL}${path}`;

    // Define all icon URLs at once
    const iconUrls = {
      snapshot: getIconUrl('/icons/delegate-compensation/thunder.png'),
      onchain: getIconUrl('/icons/delegate-compensation/chain.png'),
      delegateFeedback: getIconUrl('/icons/delegate-compensation/star.svg'),
      communicationRationale: getIconUrl(
        '/icons/delegate-compensation/megaphone.png'
      ),
      averageVotingPower: getIconUrl(
        '/icons/delegate-compensation/flexArm2.png'
      ),
      bonusPoints: getIconUrl('/icons/delegate-compensation/celebration.png'),
      participationRate: getIconUrl('/icons/delegate-compensation/up.png'),
      finalScore: getIconUrl('/icons/delegate-compensation/rocket.png'),
      checkIcon: getIconUrl('/icons/delegate-compensation/check-circle.svg'),
      karmaLogo: getIconUrl('/images/karma_logo_green.svg'),
      daoLogo: getIconUrl(`/daos/${daoName.toLowerCase()}/logo_black.svg`),
    };

    // Font and style optimization for better rendering - define once and reuse
    const styles = {
      font: {
        fontFamily: 'Inter',
        fontSmooth: 'always' as const,
        textRendering: 'optimizeLegibility' as const,
      },
      text: {
        letterSpacing: '-0.02em',
        color: '#1D2939',
        fontFamily: 'Inter',
        fontSmooth: 'always' as const,
        textRendering: 'optimizeLegibility' as const,
      },
      image: {
        objectFit: 'contain' as const,
      },
      card: {
        width: '373.33px',
        height: '170px',
        padding: '16px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column' as const,
      },
      iconContainer: {
        width: '44px',
        height: '44px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cardTitle: {
        fontSize: '18px',
        fontWeight: '600',
        marginTop: '10px',
        letterSpacing: '-0.02em',
        color: '#1D2939',
        fontFamily: 'Inter',
        fontSmooth: 'always' as const,
        textRendering: 'optimizeLegibility' as const,
      },
      cardValue: {
        fontSize: '30px',
        fontWeight: 'bold',
        letterSpacing: '-0.02em',
        color: '#1D2939',
        fontFamily: 'Inter',
        fontSmooth: 'always' as const,
        textRendering: 'optimizeLegibility' as const,
      },
    };

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            padding: '24px',
            ...styles.font,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            {/* Delegate info */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {avatarUrl && (
                <div
                  style={{
                    display: 'flex',
                    position: 'relative',
                    width: '64px',
                    height: '64px',
                    marginRight: '20px',
                  }}
                >
                  <img
                    src={avatarUrl}
                    alt="Delegate"
                    width="64"
                    height="64"
                    style={{
                      borderRadius: '50%',
                      ...styles.image,
                    }}
                  />
                  {delegateStats.incentiveOptedIn ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: '0',
                        right: '-10px',
                        display: 'flex',
                      }}
                    >
                      <img
                        src={iconUrls.checkIcon}
                        alt="Check icon"
                        width="24"
                        height="24"
                        style={{
                          ...styles.image,
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    ...styles.text,
                  }}
                >
                  {delegateName}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    ...styles.text,
                  }}
                >
                  {truncateAddress(delegateAddress)}
                </span>
              </div>
            </div>

            {/* Title */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                ...styles.text,
              }}
            >
              My {new Date(month).toLocaleString('en-US', { month: 'long' })}{' '}
              {year} Stats in
              <img
                src={iconUrls.daoLogo}
                alt={daoName}
                width="150"
                height="40"
                style={{
                  marginLeft: '15px',
                  ...styles.image,
                }}
              />
            </div>
          </div>

          {/* Stats Grid - First Row */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            {/* Snapshot Stats */}
            <div
              style={{
                ...styles.card,
                backgroundColor: '#FFF9F0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}
              >
                {/* Using the Snapshot icon and styling similar to the component */}
                <div
                  style={{
                    ...styles.iconContainer,
                  }}
                >
                  <img
                    src={iconUrls.snapshot}
                    width="44"
                    height="44"
                    alt="Snapshot"
                    style={{
                      ...styles.image,
                    }}
                  />
                </div>
                <span
                  style={{
                    ...styles.cardTitle,
                  }}
                >
                  Snapshot Stats
                </span>
              </div>
              <span style={{ ...styles.cardValue }}>
                {stats.snapshotStats.score}
              </span>
              <span style={{ ...styles.text }}>
                <span style={{ color: '#475467' }}>
                  {stats.snapshotStats.tn} Total{' '}
                  {pluralize('Proposal', +stats.snapshotStats.tn || 0)},
                </span>
                {'  '}
                <span style={{ color: '#079455', marginLeft: '4px' }}>
                  {stats.snapshotStats.rn} Voted On
                </span>
              </span>
            </div>

            {/* Onchain Stats */}
            <div
              style={{
                ...styles.card,
                backgroundColor: '#F5F9FD',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}
              >
                {/* Using the Snapshot icon and styling similar to the component */}
                <div
                  style={{
                    ...styles.iconContainer,
                  }}
                >
                  <img
                    src={iconUrls.onchain}
                    width="44"
                    height="44"
                    alt="Snapshot"
                    style={{
                      ...styles.image,
                    }}
                  />
                </div>
                <span
                  style={{
                    ...styles.cardTitle,
                  }}
                >
                  Onchain Stats
                </span>
              </div>
              <span style={{ ...styles.cardValue }}>
                {stats.onchainStats.score}
              </span>
              <span style={{ ...styles.text }}>
                <span style={{ color: '#475467' }}>
                  {stats.onchainStats.tn} Total{' '}
                  {pluralize('Proposal', +stats.onchainStats.tn || 0)},
                </span>
                {'  '}
                <span style={{ color: '#079455', marginLeft: '4px' }}>
                  {stats.onchainStats.rn} Voted On
                </span>
              </span>
            </div>

            {/* Delegate Feedback */}
            <div
              style={{
                ...styles.card,
                backgroundColor: '#F4EFFF',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}
              >
                {/* Using the Snapshot icon and styling similar to the component */}
                <div
                  style={{
                    ...styles.iconContainer,
                  }}
                >
                  <img
                    src={iconUrls.delegateFeedback}
                    width="44"
                    height="44"
                    alt="Snapshot"
                    style={{
                      ...styles.image,
                    }}
                  />
                </div>
                <span
                  style={{
                    ...styles.cardTitle,
                  }}
                >
                  Delegate Feedback
                </span>
              </div>
              <span style={{ ...styles.cardValue }}>
                {stats.delegateFeedback}
              </span>
            </div>
          </div>

          {/* Stats Grid - Second Row */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            {isOldVersion ? (
              <div
                style={{
                  ...styles.card,
                  backgroundColor: 'rgba(255, 230, 213, 0.38)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      ...styles.iconContainer,
                    }}
                  >
                    <img
                      src={iconUrls.communicationRationale}
                      width="44"
                      height="44"
                      alt="Communication Rationale"
                      style={{
                        ...styles.image,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      ...styles.cardTitle,
                    }}
                  >
                    Communication Rationale
                  </span>
                </div>
                <span style={{ ...styles.cardValue }}>
                  {stats.communicationRationale}
                </span>
              </div>
            ) : (
              <div
                style={{
                  ...styles.card,
                  backgroundColor: 'rgba(255, 230, 213, 0.38)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      ...styles.iconContainer,
                    }}
                  >
                    <img
                      src={iconUrls.averageVotingPower}
                      width="44"
                      height="44"
                      alt="Average Voting Power"
                      style={{
                        ...styles.image,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      ...styles.cardTitle,
                    }}
                  >
                    Average Voting Power
                  </span>
                </div>
                <span style={{ ...styles.cardValue }}>
                  {stats.averageVotingPower}
                </span>
              </div>
            )}

            {/* Onchain Stats */}
            <div
              style={{
                ...styles.card,
                background: 'rgba(221, 249, 242, 0.40)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}
              >
                <div
                  style={{
                    ...styles.iconContainer,
                  }}
                >
                  <img
                    src={iconUrls.bonusPoints}
                    width="44"
                    height="44"
                    alt="Bonus Points"
                    style={{
                      ...styles.image,
                    }}
                  />
                </div>
                <span
                  style={{
                    ...styles.cardTitle,
                  }}
                >
                  Bonus Points
                </span>
              </div>
              <span style={{ ...styles.cardValue }}>{stats.bonusPoints}</span>
            </div>

            <div
              style={{
                ...styles.card,
                backgroundColor: '#FFEDFA',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}
              >
                {/* Using the Snapshot icon and styling similar to the component */}
                <div
                  style={{
                    ...styles.iconContainer,
                  }}
                >
                  <img
                    src={iconUrls.participationRate}
                    width="44"
                    height="44"
                    alt="Participation Rate"
                    style={{
                      ...styles.image,
                    }}
                  />
                </div>
                <span
                  style={{
                    ...styles.cardTitle,
                  }}
                >
                  Participation Rate
                </span>
              </div>
              <span style={{ ...styles.cardValue }}>
                {stats.participationRate.score}
              </span>
              {isScoreFinalized ? (
                <span style={{ ...styles.text }}>
                  <span style={{ color: '#475467' }}>
                    {stats.participationRate.tn} Total{' '}
                    {pluralize('Proposal', +stats.participationRate.tn || 0)},
                  </span>
                  {'  '}
                  <span style={{ color: '#079455', marginLeft: '4px' }}>
                    {stats.participationRate.rn} Voted On
                  </span>
                </span>
              ) : null}
            </div>
          </div>

          {/* Final Score */}
          <div
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#DDF9F2',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              height: '150px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                position: 'relative',
              }}
            >
              {/* Using the Snapshot icon and styling similar to the component */}
              <div
                style={{
                  ...styles.iconContainer,
                }}
              >
                <img
                  src={iconUrls.finalScore}
                  width="44"
                  height="44"
                  alt="Final Score"
                  style={{
                    ...styles.image,
                  }}
                />
              </div>
              <span
                style={{
                  ...styles.text,
                  marginTop: '10px',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#079455',
                  width: '1132px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '40px',
                }}
              >
                {stats.finalScore}
              </span>
              <div
                style={{
                  display: 'flex',
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  alignItems: 'center',
                  gap: '1px',
                  flexDirection: 'column',
                }}
              >
                <p
                  style={{
                    ...styles.text,
                    marginBottom: '5px',
                  }}
                >
                  Powered by
                </p>
                <img
                  src={iconUrls.karmaLogo}
                  width="132"
                  height="32"
                  alt="Karma Logo"
                  style={{ ...styles.image }}
                />
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 675,
        headers: {
          'Content-Type': 'image/png',
        },
        fonts: [
          {
            name: 'Inter',
            data: fontData[0],
            weight: 300,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: fontData[1],
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: fontData[2],
            weight: 500,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: fontData[3],
            weight: 600,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: fontData[4],
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
