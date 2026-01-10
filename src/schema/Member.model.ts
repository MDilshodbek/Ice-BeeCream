import mongoose, { Schema } from "mongoose";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";

// Schema first & code first
const memberSchema = new Schema(
  {
    memberType: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
    },

    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },

    memberNick: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
      index: { unique: true, sparse: true },
    },

    memberPhone: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{9,15}$/,
      index: { unique: true, sparse: true },
    },

    memberPassword: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    memberAddress: {
      type: String,
    },

    memberDesc: {
      type: String,
    },

    memberImage: {
      type: String,
    },

    memberPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // updatedAt, createdAt
);

export default mongoose.model("Member", memberSchema);
