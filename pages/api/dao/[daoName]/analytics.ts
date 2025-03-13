import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

/**
 * API handler for fetching DAO analytics data for any DAO
 * 
 * @param req - Next.js API request
 * @param res - Next.js API response
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get the DAO name from the URL
  const { daoName } = req.query;

  if (!daoName || typeof daoName !== 'string') {
    return res.status(400).json({ message: 'DAO name is required' });
  }

  try {
    // Make a real call to the Karma API
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_KARMA_API}/dao/${daoName}/analytics`
    );

    // Check if the response has a data property (common API pattern)
    const responseData = response.data.data || response.data;

    // Return the data from the Karma API
    return res.status(200).json(responseData);
  } catch (error) {
    console.error(`Error fetching analytics for DAO ${daoName}:`, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 