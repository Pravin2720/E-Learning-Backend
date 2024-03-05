import mongoose from "mongoose";

const VariablesSchema = new mongoose.Schema({
  key: String,
  value: Object,
});

export const Variables = mongoose.model("Variables", VariablesSchema, "variables");
