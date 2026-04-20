export type QuestVerificationRule = {
  requireVisit: boolean;
  requireFree: boolean;
  requireEmber: boolean;
  requireCelestial: boolean;
};

// Edit these booleans to control quest-drop verification globally.
export const questDropVerificationRule: QuestVerificationRule = {
  requireVisit: false,
  requireFree: false,
  requireEmber: false,
  requireCelestial: false,
};
