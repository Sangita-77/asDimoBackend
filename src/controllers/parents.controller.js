import {
    assetmentTestService
  } from "../services/parents.service.js";
  import { asyncHandler } from "../utils/asyncHandler.js";
  


export const assesmentTestCon = asyncHandler(async (req , res) => {

  const { parentId, answers } = req.body;

  if (!parentId || !answers ) {
    return res.status(400).json({
      success: false,
      message: "Please provide parentId, answers ",
    });
  }

  const testData = await assetmentTestService(req.body);

  res.status(200).json({
    success: true,
    data: testData,
  });

});