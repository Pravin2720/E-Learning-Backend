import mongoose from "mongoose";
import { ErrorResponse, ErrorResponseWrapper } from "../middlewares/index.js";

import getLogger from "../logger/index.js";
const logger = getLogger(import.meta.url);

const replaceId = ({ _id, ...rest }) => {
  return { ...rest, id: _id };
};

export function createVerboseQuery(query) {
  let verbose_query = {};
  const _f = (obj, parent_keys) => {
    let range_pair = {};
    for (const key in obj) {
      // create dot-chained key
      const new_key = [...parent_keys, key].join(".");
      if (key === "q") {
        verbose_query["$text"] = { $search: obj[key] };
      } else if (typeof obj[key] === "boolean") {
        verbose_query[new_key] = obj[key];
      } else if (typeof obj[key] === "string") {
        // wrap string with $eq
        if (mongoose.isValidObjectId(obj[key])) {
          verbose_query[new_key] = mongoose.Types.ObjectId(obj[key]);
        } else {
          verbose_query[new_key] = { $eq: obj[key] };
        }
      } else if (typeof obj[key] === "number") {
        // look for timestamps
        // wrap start and end with $gte and $lte respectively
        let range_key = key === "start_date" ? "$gte" : key === "end_date" ? "$lte" : key;
        if (!range_pair[range_key]) {
          range_pair[range_key] = obj[key];
        }
        verbose_query[parent_keys.join(".")] = range_pair;
      } else if (typeof obj[key] === "object") {
        // wrap arrays with $in
        if (!Array.isArray(obj[key])) {
          // iterate over nested object
          _f(obj[key], [...parent_keys, key]);
        } else {
          if (!key.startsWith("$")) {
            if (key === "_id") {
              verbose_query[new_key] = {
                $in: obj[key]
                  .filter((v) => typeof v === "string" && mongoose.isValidObjectId(v))
                  .map((v) => mongoose.Types.ObjectId(v)),
              };
            } else {
              verbose_query[new_key] = { $in: obj[key] };
            }
          } else if (key === "$or" || key === "$and") {
            verbose_query[key] = obj[key].map((condition) => createVerboseQuery(condition));
          }
        }
      }
    }
  };
  _f(query, []);
  return verbose_query;
}

export function sanitize_projections(projections) {
  return Array.isArray(projections) ? projections.join(" ") : typeof projections === "string" ? projections : "";
}

export async function readListShapeHandler(query, model, defaultFilter = {}, projections = []) {
  const { filter, page, limit, sort } = query;
  const filters = createVerboseQuery(mongoose.sanitizeFilter({ ...defaultFilter, ...JSON.parse(filter || "{}") }));
  const pageSize = parseInt(limit) || 10;
  const offset = (page - 1 > 0 ? page - 1 : 0) * pageSize;
  const sortConfig = JSON.parse(sort || "{}");
  let sortFields = {};
  if (sortConfig.field) sortFields[sortConfig.field] = sortConfig.order.toLowerCase();
  else sortFields["_id"] = "desc";

  try {
    var total = await model.find(filters).countDocuments();
    var results = await model
      .find(filters)
      .select(sanitize_projections(projections))
      .sort(sortFields)
      .skip(offset)
      .limit(pageSize)
      .lean();
  } catch (error) {
    throw ErrorResponseWrapper(error);
  }

  return {
    data: results.map((record) => replaceId(record)),
    total: total,
  };
}

export async function readOneShapeHandler(model, filter = {}, projections = []) {
  const filters = createVerboseQuery(mongoose.sanitizeFilter(filter));
  try {
    var result = await model.findOne(filters).select(sanitize_projections(projections)).lean();
  } catch (error) {
    throw ErrorResponseWrapper(error);
  }

  if (!result) throw new ErrorResponse("resource not found", 404);

  return {
    data: replaceId(result),
  };
}

// export async function updateListShapeHandler(query, model, defaultFilter = {}, projections = []) {
//   const { filter, page, limit, sort } = query;
//   const filters = createVerboseQuery(mongoose.sanitizeFilter({ ...defaultFilter, ...JSON.parse(filter || "{}") }));
//   const pageSize = parseInt(limit) || 10;
//   const offset = (page - 1 > 0 ? page - 1 : 0) * pageSize;
//   const sortConfig = JSON.parse(sort || "{}");
//   let sortFields = {};
//   if (sortConfig.field) sortFields[sortConfig.field] = sortConfig.order.toLowerCase();
//   else sortFields["_id"] = "desc";

//   try {
//     var total = await model.find(filters).countDocuments();
//     var results = await model
//       .find(filters)
//       .select(sanitize_projections(projections))
//       .sort(sortFields)
//       .skip(offset)
//       .limit(pageSize)
//       .lean();
//   } catch (error) {
//     throw ErrorResponseWrapper(error);
//   }

//   return {
//     data: results.map((record) => replaceId(record)),
//     total: total,
//   };
// }

export async function updateOneShapeHandler(model, data, filter = {}, projections = []) {
  try {
    var match = await model.findOne(createVerboseQuery(mongoose.sanitizeFilter(filter))).lean();
  } catch (error) {
    throw ErrorResponseWrapper(error);
  }

  if (!match) throw new ErrorResponse("resource not found", 404);

  try {
    var update = await model.updateOne({ _id: match._id }, { $set: { ...data, updated_at: Date.now() } });
  } catch (error) {
    throw ErrorResponseWrapper(error);
  }

  const result = await model.findOne({ _id: match._id }).select(sanitize_projections(projections)).lean();
  logger.debug(match, update, result);

  return {
    data: replaceId(result),
    match: replaceId(match),
  };
}

export async function createShapeHandler(model, data = {}) {
  try {
    var result = await model.create(data);
  } catch (error) {
    throw ErrorResponseWrapper(error);
  }

  return {
    data: replaceId(result),
  };
}

export async function deleteListShapeHandler(query, model, defaultFilter = {}) {
  const { filter } = query;
  const filters = createVerboseQuery(mongoose.sanitizeFilter({ ...defaultFilter, ...JSON.parse(filter || "{}") }));

  try {
    var data = await model.find(filters).lean();
    var results = await model.updateMany(filters, {
      $set: { active: false, updated_at: Date.now(), deactivated_at: Date.now() },
    });
  } catch (error) {
    throw ErrorResponseWrapper(error);
  }

  return { data: data.map((record) => replaceId(record)), deleted: results.modifiedCount };
}

export async function deleteOneShapeHandler(model, filter = {}) {
  const filters = createVerboseQuery(mongoose.sanitizeFilter(filter));

  try {
    var data = await model.findOne(filters).lean();
    var result = await model.updateOne(filters, {
      $set: { active: false, updated_at: Date.now(), deactivated_at: Date.now() },
    });
  } catch (error) {
    throw ErrorResponseWrapper(error);
  }

  return {
    data: replaceId(data),
    message: result.modifiedCount === 1 ? "success" : "resource not found",
  };
}
