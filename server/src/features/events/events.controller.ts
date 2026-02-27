import type { Request, Response } from 'express';
import { accessSheets } from './lib/access-sheets';
import { verifyParticipants } from './lib/verification-engine';
import { BaseResponseDTO } from '@auxilium/types/response';

export const generatePointsSheet = async (req: Request, res: Response) => {
  // Assume URL format is https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit
  const { signupUrl, feedbackUrl, helperUrl, eventName } = req.body;

  // TODO: add url validation and error handling

  // Get responses from each form (including questions headers)
  // TODO: in the future, make a UI for user to select which columns is for what
  // For now assume general structure.
  const signupData = await accessSheets({
    spreadsheetId: signupUrl.split('/')[5],
  });
  const feedbackData = await accessSheets({
    spreadsheetId: feedbackUrl.split('/')[5],
  });

  // TODO: Optimise next time
  const helperData = (
    await accessSheets({
      spreadsheetId: helperUrl.split('/')[5],
    })
  ).filter((row) => row[6] === eventName);

  console.log('Signup Data Sample:', signupData[1]);
  console.log('Feedback Data Sample:', feedbackData[1]);
  console.log('Helper Data Sample:', helperData[1]);

  // Exclude header row
  const signupCount = signupData.length - 1;
  const feedbackCount = feedbackData.length - 1;
  const helperCount = helperData.length;

  // TODO: add explicit types here to translate from raw sheet data to more structured data, based on column headers
  const verificationResult = await verifyParticipants(
    signupData,
    feedbackData,
    helperData,
  );

  const turnupRate = (
    (verificationResult.participants.length / signupCount) *
    100
  ).toFixed(2);

  res.status(200).json({
    status: 'success',
    message: 'Points sheet generated successfully',
    data: {
      signupCount,
      feedbackCount,
      helperCount,
      participants: verificationResult.participants,
      stats: {
        turnupRate: parseFloat(turnupRate),
        ...verificationResult.stats,
      },
    },
  } as BaseResponseDTO);
};
