import { ObjectId } from "mongoose";
import { LikeGroup } from "../enums/like.enum";

export interface Like {
  _id: ObjectId;
  likeGroup: LikeGroup;
  memberId: ObjectId;
  likeRefId: ObjectId;
  createdAt: Date;
  updateAt: Date;
}

export interface LikeInput {
  memberId: ObjectId;
  likeRefId: ObjectId;
  likeGroup: LikeGroup;
}

export interface StatisticModifier {
	_id: ObjectId;
	targetKey: string;
	modifier: number
}
