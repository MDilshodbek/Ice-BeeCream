import { ObjectId } from "mongoose";
import { LikeGroup } from "../enums/like.enum";

export interface View {
  _id: ObjectId;
  viewGroup: LikeGroup;
  memberId: ObjectId;
  likeRefId: ObjectId;
  createdAt: Date;
  updateAt: Date;
}

export interface ViewInput {
  memberId: ObjectId;
  viewRefId: ObjectId;
  likeGroup: LikeGroup;
}
