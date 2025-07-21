import mongoose, { Schema } from "mongoose";
import { LikeGroup } from "../libs/enums/like.enum";

// Schema first & code first
const likeSchema = new Schema(
  {
    likeGroup: {
      type: String,
      enum: LikeGroup,
      required: true,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },

    likeRefId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Like", likeSchema);
