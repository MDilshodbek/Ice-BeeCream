import { T } from "../libs/types/common";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/errors";
import { Like, LikeInput } from "../libs/types/like";
import LikeModel from "../schema/Like.model";
import { ObjectId } from "mongoose";

class LikeService {
  private readonly likeModel;

  constructor() {
    this.likeModel = LikeModel;
  }

  public async toggleLike(input: LikeInput): Promise<number> {
    const search: T = {
        memberId: input.memberId,
        likeRefId: input.likeRefId,
        likeGroup: input.likeGroup,
      },
      exist = await this.likeModel.findOne(search).exec();
    let modifier = 1;

    if (exist) {
      await this.likeModel.findOneAndDelete(search).exec();
      modifier = -1;
    } else {
      try {
        await this.likeModel.create(input);
      } catch (err) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
      }
    }

    return modifier;
  }

  public async checkLikeExistence(input: LikeInput): Promise<boolean> {
    const exists = await this.likeModel.exists({
      memberId: input.memberId,
      likeRefId: input.likeRefId,
      likeGroup: input.likeGroup,
    });
    return !!exists; // Converts to true/false
  }
}

export default LikeService;
