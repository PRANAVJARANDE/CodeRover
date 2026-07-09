import {Tweet} from "../models/tweet.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import mongoose from "mongoose"

const createTweet = asyncHandler(async (req, res) => {
    const {content,replyOf}=req.body;
    const imagelocalPath=req.file?.path;
    if(!content)return res.status(400).json(new ApiResponse(400,null,"Content is Required"));
    let image="";
    if(imagelocalPath)
    {
        image=await uploadOnCloudinary(imagelocalPath);
    }

    const tweetData = {
        content,
        owner: req.user?._id,
        image: image.url,
    };

    if (replyOf) tweetData.replyOf = replyOf;
    const tweet = await Tweet.create(tweetData);    
    if(tweet)return res.status(200).json(new ApiResponse(200,tweet,"Tweet created Successfully"));
    else
    {
        return res.status(500).json(new ApiResponse(500,null,"Server Error"));
    }
});

const getAllTweets = asyncHandler(async (req, res) => {
    const alltweets = await Tweet.aggregate([
        {
            $match: {
                $or: [
                    { replyOf: { $exists: false } },
                    { replyOf: null },
                    { replyOf: '' }
                ]
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            username: 1,
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: 'tweets',
                localField: '_id',
                foreignField: 'replyOf',
                as: 'replys',
                pipeline:[
                    {
                        $lookup: {
                        from: 'users',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'owner',
                        pipeline: [
                            {
                                $project: {
                                    avatar: 1,
                                    username: 1,
                                }
                            }
                        ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    },
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    if (alltweets.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No tweets made"));
    }

    return res.status(200).json(new ApiResponse(200, alltweets, "Tweets fetched Successfully"));
});

const getTweetsofProblem = asyncHandler(async (req, res) => {
    const {id}=req.params;
    const alltweets = await Tweet.aggregate([
        {
            $match: {
                replyOf: new mongoose.Types.ObjectId(id),
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            username: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    if (alltweets.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No tweets made"));
    }

    return res.status(200).json(new ApiResponse(200, alltweets, "Tweets fetched Successfully"));
});

const deleteTweetById = asyncHandler(async (req, res) => {
    const {tweet_id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(tweet_id)) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid tweet id"));
    }

    const tweet = await Tweet.findById(tweet_id);

    if (!tweet) {
        return res.status(404).json(new ApiResponse(404, null, "Tweet not found"));
    }

    const tweetIdsToDelete = [tweet._id];
    const seenTweetIds = new Set([tweet._id.toString()]);
    let index = 0;

    while (index < tweetIdsToDelete.length) {
        const currentIds = tweetIdsToDelete.slice(index);
        index = tweetIdsToDelete.length;

        const replies = await Tweet.find({ replyOf: { $in: currentIds } }).select("_id").lean();
        for (const reply of replies) {
            const replyId = reply._id.toString();
            if (!seenTweetIds.has(replyId)) {
                seenTweetIds.add(replyId);
                tweetIdsToDelete.push(reply._id);
            }
        }
    }

    const deletedTweets = await Tweet.deleteMany({ _id: { $in: tweetIdsToDelete } });

    return res.status(200).json(
        new ApiResponse(
            200,
            { deletedTweet: tweet, deletedCount: deletedTweets.deletedCount },
            "Tweet deleted successfully"
        )
    );
});

export {createTweet,getAllTweets,getTweetsofProblem,deleteTweetById}
