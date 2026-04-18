export type QuestVerificationRule = {
  requireVisit: boolean;
  requireFree: boolean;
  requireEmber: boolean;
  requireCelestial: boolean;
};

// Edit these booleans to control quest-drop verification globally.
export const questDropVerificationRule: QuestVerificationRule = {
  requireVisit: true,
  requireFree: true,
  requireEmber: false,
  requireCelestial: false,
};
