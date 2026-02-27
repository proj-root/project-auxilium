export async function verifyParticipants(
  signupData: string[][],
  feedbackData: string[][],
  helperData: string[][],
) {
  const participantArray: string[][] = [];
  let invalidCount = 0;
  let courseTurnup: Record<string, number> = {};

  for (const student of signupData.slice(1)) {
    // Skip header row
    // TODO: Use better typing in the future
    const studentAdminNum = student[2];
    const feedbackEntry = feedbackData.find(
      (entry) => entry[3] === studentAdminNum,
    );
    const helperEntry = helperData.find((entry) => entry[4] === studentAdminNum);

    if (!feedbackEntry) {
      console.log(
        `No feedback found for student with admin number: ${studentAdminNum}. Invalid participant, skipping.`,
      );
      invalidCount++;
      continue;
    } else if (helperEntry) {
      console.log(
        `Helper entry found for student with admin number: ${studentAdminNum}. Invalid participant, skipping.`,
      );
      invalidCount++;
      continue;
    }

    // Calculate course turnup stats
    const courseName = student[5]; // Assuming course name is in the 6th column (index 5)
    if (courseName) courseTurnup[courseName] = (courseTurnup[courseName] || 0) + 1;

    participantArray.push(student);
  }

  return {
    participants: participantArray,
    stats: {
      invalidCount,
      courseTurnup,
    },
  };
}
