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

    // Using fetch instead of axios for Edge runtime compatibility
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

    const delegateStatsResponse = await response.json();
    const delegateStats = delegateStatsResponse.data
      .delegates[0] as DelegateStatsFromAPI;
    if (!delegateStats) {
      return new Response(`Delegate not found`, {
        status: 404,
      });
    }

    const prBreakdown = await getPRBreakdown(
      delegateAddress,
      daoName,
      month,
      year
    );
    if (!prBreakdown) {
      return new Response(`Delegate not found`, {
        status: 404,
      });
    }

    const proposals = await getProposals(daoName, month, year);

    const isScoreFinalized = proposals.finished;

    // Stats data
    let stats: {
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
      communicationRationale?: string;
      bonusPoints: string;
      finalScore: string;
      averageVotingPower?: string;
    } = {
      snapshotStats: {
        score:
          formatSimpleNumber(delegateStats.stats.snapshotVoting.score) || '-',
        tn: delegateStats.stats.snapshotVoting.tn || '-',
        rn: delegateStats.stats.snapshotVoting.rn || '-',
      },
      onchainStats: {
        score:
          formatSimpleNumber(delegateStats.stats.onChainVoting.score) || '-',
        tn: delegateStats.stats.onChainVoting.tn || '-',
        rn: delegateStats.stats.onChainVoting.rn || '-',
      },
      participationRate: {
        score: '-',
        tn: '-',
        rn: '-',
      },
      delegateFeedback: '-',
      communicationRationale: '-',
      bonusPoints: '-',
      finalScore: '-',
    };
    if (isScoreFinalized) {
      stats = {
        ...stats,
        participationRate: {
          score:
            formatSimpleNumber(delegateStats.stats.participationRate) || '-',
          tn: formatSimpleNumber(prBreakdown?.proposals?.length) || '-',
          rn: formatSimpleNumber(prBreakdown?.votes?.length) || '-',
        },
        delegateFeedback:
          formatSimpleNumber(
            delegateStats.stats.delegateFeedback?.finalScore || 0
          ) || '-',

        bonusPoints: formatSimpleNumber(delegateStats.stats.bonusPoint) || '-',
        finalScore:
          formatSimpleNumber(delegateStats.stats.totalParticipation) || '-',
      };
    }
    const compensationConfigs = compensation.compensationDates[daoName];
    // Check which version applies based on the selected month/year
    const selectedDate = new Date(`${year}-${month}-11`);

    // Find the applicable version for the selected date
    const applicableVersion = compensationConfigs?.versions.find(version => {
      const startDate = new Date(version.startDate);
      const endDate = version.endDate ? new Date(version.endDate) : new Date();

      // Check if the selected date falls within this version's date range
      return selectedDate >= startDate && selectedDate <= endDate;
    });
    if (
      // Use communicationRationale for old version, averageVotingPower for newer versions
      applicableVersion?.versionNumber &&
      applicableVersion?.versionNumber <= 1.5
    ) {
      stats = {
        ...stats,
        communicationRationale: isScoreFinalized
          ? formatSimpleNumber(
              delegateStats.stats.communicatingRationale.score
            ) || '-'
          : '-',
      };
    } else {
      stats = {
        ...stats,
        averageVotingPower: isScoreFinalized
          ? formatNumber(delegateStats.stats.votingPowerAverage || 0) || '-'
          : '-',
      };
    }

    // Avatar URL (with fallback)
    const avatarUrl =
      delegateStats.profilePicture ||
      blo(delegateStats.publicAddress as `0x${string}`) ||
      '';

    const delegateName =
      delegateStats.name ||
      delegateStats.ensName ||
      delegateStats.publicAddress;

    // Use SVG for Snapshot icon if possible for better quality
    const BASE_URL = 'http://localhost:3000';
    const snapshotIconUrl = `${BASE_URL}/icons/delegate-compensation/thunder.png`;
    const onchainIconUrl = `${BASE_URL}/icons/delegate-compensation/chain.png`;
    const delegateFeedbackIconUrl = `${BASE_URL}/icons/delegate-compensation/star.svg`;
    const communicationRationaleIconUrl = `${BASE_URL}/icons/delegate-compensation/megaphone.png`;
    const averageVotingPowerIconUrl = `${BASE_URL}/icons/delegate-compensation/flexArm2.png`;
    const bonusPointsIconUrl = `${BASE_URL}/icons/delegate-compensation/celebration.png`;
    const participationRateIconUrl = `${BASE_URL}/icons/delegate-compensation/up.png`;
    const finalScoreIconUrl = `${BASE_URL}/icons/delegate-compensation/rocket.png`;
    const checkIconUrl = `${BASE_URL}/icons/delegate-compensation/check-circle.svg`;
    const karmaLogoGreen = `${BASE_URL}/images/karma_logo_green.svg`;
    const daoLogoUrl = `${BASE_URL}/daos/${daoName}/logo_black.svg`;

    // Font optimization for better rendering
    const fontStyle = {
      fontFamily: 'Inter',
      fontSmooth: 'always' as const,
      textRendering: 'optimizeLegibility' as const,
    };

    // Text style for better rendering
    const textStyle = {
      letterSpacing: '-0.02em',
      color: '#1D2939',
      ...fontStyle,
    };

    // Image optimization settings
    const imageStyle = {
      objectFit: 'contain' as const,
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
            ...fontStyle,
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
                      ...imageStyle,
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
                        src={checkIconUrl}
                        alt="Check icon"
                        width="24"
                        height="24"
                        style={{
                          ...imageStyle,
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
                    ...textStyle,
                  }}
                >
                  {delegateName}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    ...textStyle,
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
                ...textStyle,
              }}
            >
              My {new Date(month).toLocaleString('en-US', { month: 'long' })}{' '}
              {year} Stats in
              <img
                src={daoLogoUrl}
                alt={daoName}
                width="150"
                height="40"
                style={{
                  marginLeft: '15px',
                  ...imageStyle,
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
                width: '373.33px',
                height: '170px',
                padding: '16px',
                backgroundColor: '#FFF9F0',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
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
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={snapshotIconUrl}
                    // src="http://localhost:3000/icons/delegate-compensation/thunder.png"
                    width="44"
                    height="44"
                    alt="Snapshot"
                    style={{
                      ...imageStyle,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginTop: '10px',
                    ...textStyle,
                  }}
                >
                  Snapshot Stats
                </span>
              </div>
              <span
                style={{ fontSize: '30px', fontWeight: 'bold', ...textStyle }}
              >
                {stats.snapshotStats.score}
              </span>
              <span style={{ fontSize: '14px', ...textStyle }}>
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
                width: '373.33px',
                height: '170px',
                padding: '16px',
                backgroundColor: '#F5F9FD',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
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
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={onchainIconUrl}
                    width="44"
                    height="44"
                    alt="Snapshot"
                    style={{
                      ...imageStyle,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginTop: '10px',
                    ...textStyle,
                  }}
                >
                  Onchain Stats
                </span>
              </div>
              <span
                style={{ fontSize: '30px', fontWeight: 'bold', ...textStyle }}
              >
                {stats.onchainStats.score}
              </span>
              <span style={{ fontSize: '14px', ...textStyle }}>
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
                width: '373.33px',
                height: '170px',
                padding: '16px',
                backgroundColor: '#F4EFFF',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
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
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={delegateFeedbackIconUrl}
                    width="44"
                    height="44"
                    alt="Snapshot"
                    style={{
                      ...imageStyle,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginTop: '10px',
                    ...textStyle,
                  }}
                >
                  Delegate Feedback
                </span>
              </div>
              <span
                style={{ fontSize: '30px', fontWeight: 'bold', ...textStyle }}
              >
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
            {applicableVersion?.versionNumber &&
            applicableVersion?.versionNumber <= 1.5 ? (
              <div
                style={{
                  width: '373.33px',
                  height: '170px',
                  padding: '16px',
                  backgroundColor: 'rgba(255, 230, 213, 0.38)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
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
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={communicationRationaleIconUrl}
                      width="44"
                      height="44"
                      alt="Communication Rationale"
                      style={{
                        ...imageStyle,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginTop: '10px',
                      ...textStyle,
                    }}
                  >
                    Communication Rationale
                  </span>
                </div>
                <span
                  style={{ fontSize: '30px', fontWeight: 'bold', ...textStyle }}
                >
                  {stats.communicationRationale}
                </span>
              </div>
            ) : (
              <div
                style={{
                  width: '373.33px',
                  height: '170px',
                  padding: '16px',
                  backgroundColor: 'rgba(255, 230, 213, 0.38)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
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
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={averageVotingPowerIconUrl}
                      width="44"
                      height="44"
                      alt="Average Voting Power"
                      style={{
                        ...imageStyle,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginTop: '10px',
                      ...textStyle,
                    }}
                  >
                    Average Voting Power
                  </span>
                </div>
                <span
                  style={{ fontSize: '30px', fontWeight: 'bold', ...textStyle }}
                >
                  {stats.averageVotingPower}
                </span>
              </div>
            )}

            {/* Onchain Stats */}
            <div
              style={{
                width: '373.33px',
                height: '170px',
                padding: '16px',
                background: 'rgba(221, 249, 242, 0.40)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
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
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={bonusPointsIconUrl}
                    width="44"
                    height="44"
                    alt="Bonus Points"
                    style={{
                      ...imageStyle,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginTop: '10px',
                    ...textStyle,
                  }}
                >
                  Bonus Points
                </span>
              </div>
              <span
                style={{ fontSize: '30px', fontWeight: 'bold', ...textStyle }}
              >
                {stats.bonusPoints}
              </span>
            </div>

            <div
              style={{
                width: '373.33px',
                height: '170px',
                padding: '16px',
                backgroundColor: '#FFEDFA',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
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
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={participationRateIconUrl}
                    width="44"
                    height="44"
                    alt="Participation Rate"
                    style={{
                      ...imageStyle,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginTop: '10px',
                    ...textStyle,
                  }}
                >
                  Participation Rate
                </span>
              </div>
              <span
                style={{ fontSize: '30px', fontWeight: 'bold', ...textStyle }}
              >
                {stats.participationRate.score}
              </span>
              {isScoreFinalized ? (
                <span style={{ fontSize: '14px', ...textStyle }}>
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
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  src={finalScoreIconUrl}
                  width="44"
                  height="44"
                  alt="Final Score"
                  style={{
                    ...imageStyle,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginTop: '10px',
                  ...textStyle,
                }}
              >
                Final Score
              </span>
              <p
                style={{
                  ...textStyle,
                  marginTop: '-2px',
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
              </p>
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
                    fontSize: '16px',
                    fontWeight: '500',
                    marginBottom: '5px',
                    ...textStyle,
                  }}
                >
                  Powered by
                </p>
                <img
                  src={karmaLogoGreen}
                  width="132"
                  height="32"
                  alt="Karma Logo"
                  style={{ ...imageStyle }}
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
            data: await fetch(
              new URL(
                './assets/fonts/Inter_Light.ttf',
                import.meta.url
              ).toString()
            ).then(res => res.arrayBuffer()),
            weight: 300,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: await fetch(
              new URL(
                './assets/fonts/Inter_Regular.ttf',
                import.meta.url
              ).toString()
            ).then(res => res.arrayBuffer()),
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: await fetch(
              new URL(
                './assets/fonts/Inter_Medium.ttf',
                import.meta.url
              ).toString()
            ).then(res => res.arrayBuffer()),
            weight: 500,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: await fetch(
              new URL(
                './assets/fonts/Inter_SemiBold.ttf',
                import.meta.url
              ).toString()
            ).then(res => res.arrayBuffer()),
            weight: 600,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: await fetch(
              new URL(
                './assets/fonts/Inter_Bold.ttf',
                import.meta.url
              ).toString()
            ).then(res => res.arrayBuffer()),
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
