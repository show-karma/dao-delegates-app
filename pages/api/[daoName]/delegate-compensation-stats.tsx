import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { DelegateStatsFromAPI } from 'types';
import { truncateAddress } from 'utils/truncateAddress';
import { formatSimpleNumber } from 'utils/formatNumber';
import { getPRBreakdown } from 'utils/delegate-compensation/getPRBreakdown';
import pluralize from 'pluralize';

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
    console.log('daoName', daoName);

    // Get data from query params
    const delegateAddress = searchParams.get('address');
    const month =
      searchParams.get('month') ||
      new Date().toLocaleString('default', { month: 'short' });
    const year =
      searchParams.get('year') || new Date().getFullYear().toString();

    if (!delegateAddress) {
      return new Response(`Delegate address is required`, {
        status: 400,
      });
    }

    // Using fetch instead of axios for Edge runtime compatibility
    const apiUrl = new URL(
      '/api/delegate/arbitrum/incentive-programs-stats',
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
      'arbitrum',
      month,
      year
    );
    if (!prBreakdown) {
      return new Response(`Delegate not found`, {
        status: 404,
      });
    }

    // Stats data
    const snapshotStats =
      formatSimpleNumber(delegateStats.stats.snapshotVoting.score) || '-';
    const snapshotProposals = delegateStats.stats.snapshotVoting.tn || '-';
    const snapshotVoted = delegateStats.stats.snapshotVoting.rn || '-';

    const onchainStats =
      formatSimpleNumber(delegateStats.stats.onChainVoting.score) || '-';
    const onchainProposals = delegateStats.stats.onChainVoting.tn || '-';
    const onchainVoted = delegateStats.stats.onChainVoting.rn || '-';

    const participationRate =
      formatSimpleNumber(delegateStats.stats.participationRate) || '-';
    const participationRateTn =
      formatSimpleNumber(prBreakdown?.proposals?.length) || '-';
    const participationRateRn =
      formatSimpleNumber(prBreakdown?.votes?.length) || '-';

    const delegateFeedback =
      formatSimpleNumber(
        delegateStats.stats.delegateFeedback?.finalScore || 0
      ) || '-';
    const communicationRationale =
      formatSimpleNumber(delegateStats.stats.communicatingRationale.score) ||
      '-';
    const bonusPoints =
      formatSimpleNumber(delegateStats.stats.bonusPoint) || '-';

    const finalScore =
      formatSimpleNumber(delegateStats.stats.totalParticipation) || '-';

    // Avatar URL (with fallback)
    const avatarUrl = delegateStats.profilePicture || '';

    const delegateName =
      delegateStats.name ||
      delegateStats.ensName ||
      delegateStats.publicAddress;

    // Try to use SVG versions of icons where possible for better quality

    // Use SVG for Snapshot icon if possible for better quality
    const BASE_URL = 'http://localhost:3000';
    const snapshotIconUrl = `${BASE_URL}/icons/delegate-compensation/thunder.png`;
    const onchainIconUrl = `${BASE_URL}/icons/delegate-compensation/chain.png`;
    const delegateFeedbackIconUrl = `${BASE_URL}/icons/delegate-compensation/star.svg`;
    const communicationRationaleIconUrl = `${BASE_URL}/icons/delegate-compensation/megaphone.png`;
    const bonusPointsIconUrl = `${BASE_URL}/icons/delegate-compensation/celebration.png`;
    const participationRateIconUrl = `${BASE_URL}/icons/delegate-compensation/up.png`;
    const finalScoreIconUrl = `${BASE_URL}/icons/delegate-compensation/rocket.png`;
    const checkIconUrl = `${BASE_URL}/icons/delegate-compensation/check-circle.svg`;
    const daoLogoUrl = `${BASE_URL}/daos/${daoName}/logo_black.svg`;

    // Font optimization for better rendering
    const fontStyle = {
      // fontFamily:
      //   'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
                {snapshotStats}
              </span>
              <span style={{ fontSize: '14px', ...textStyle }}>
                <span style={{ color: '#475467' }}>
                  {snapshotProposals} Total{' '}
                  {pluralize('Proposal', +snapshotProposals || 0)},
                </span>
                {'  '}
                <span style={{ color: '#079455', marginLeft: '4px' }}>
                  {snapshotVoted} Voted On
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
                {onchainStats}
              </span>
              <span style={{ fontSize: '14px', ...textStyle }}>
                <span style={{ color: '#475467' }}>
                  {onchainProposals} Total{' '}
                  {pluralize('Proposal', +onchainProposals || 0)},
                </span>
                {'  '}
                <span style={{ color: '#079455', marginLeft: '4px' }}>
                  {onchainVoted} Voted On
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
                {delegateFeedback}
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
                {communicationRationale}
              </span>
            </div>

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
                {bonusPoints}
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
                {participationRate}
              </span>
              <span style={{ fontSize: '14px', ...textStyle }}>
                <span style={{ color: '#475467' }}>
                  {participationRateTn} Total{' '}
                  {pluralize('Proposal', +participationRateTn || 0)},
                </span>
                {'  '}
                <span style={{ color: '#079455', marginLeft: '4px' }}>
                  {participationRateRn} Voted On
                </span>
              </span>
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
                {finalScore}
              </p>
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
