export const AUTH_TIMER = 24;
export const MORGAN_FORMAT = `:method :url :response-time [:status] \n`;
import mongoose from "mongoose";
import { ObjectId } from "mongoose";

export const shapeIntoMongooseObjectId = (target: any) => {
  return typeof target === "string"
    ? new mongoose.Types.ObjectId(target)
    : target;
};

export const lookupAuthMemberLiked = (memberId: ObjectId | null) => {
  if (!memberId) return []; 

  const memberObjectId = shapeIntoMongooseObjectId(memberId);

  return [
    {
      $lookup: {
        from: "likes",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$likeRefId", "$$productId"] },
                  { $eq: ["$memberId", memberObjectId] },
                  { $eq: ["$likeGroup", "PRODUCT"] },
                ],
              },
            },
          },
        ],
        as: "likeDocs",
      },
    },
    {
      $addFields: {
        meLiked: { $gt: [{ $size: "$likeDocs" }, 0] }, 
      },
    },
    {
      $project: {
        likeDocs: 0,
      },
    },
  ];
};

