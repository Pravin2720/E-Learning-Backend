import models from "../models/index.js";

import getLogger from "../logger/index.js";
const logger = getLogger(import.meta.url);

// entity_type is valid if model exists in mapping below
export const EntityTypeModelMap = { course: models.courses, bundle: models.bundles, workshop: models.workshops };

export async function checkTestEmail(email) {
  const test_emails = await models.variables.findOne({ key: "payment_test_emails" }).lean();
  return Array.isArray(test_emails?.value) && test_emails.value.indexOf(email) !== -1;
}

export async function fetchOnePriceData(entity_type, entity_id) {
  // validate if entity_type is existing
  const model = EntityTypeModelMap[entity_type];
  if (!model) {
    logger.debug(`Invalid entity_type | entity_type: ${entity_type} | entity_id: ${entity_id}`);
    return { error: "Invalid entity_type", valid: false };
  }

  // validate if entity_id is existing
  const valid_entity = await model.findOne({ slug: entity_id, active: true }).select("markup_price offer_price").lean();
  if (!valid_entity) {
    logger.debug(`Invalid entity_id | entity_type: ${entity_type} | entity_id: ${entity_id}`);
    return { error: "Invalid entity_id", valid: false };
  }

  return { ...valid_entity, valid: true };
}

export async function fetchManyPriceData(entities) {
  return await Promise.all(
    entities.map(async (entity) => ({
      ...entity,
      ...((await fetchOnePriceData(entity?.entity_type, entity?.entity_id)) ?? {}),
    })),
  );
}
