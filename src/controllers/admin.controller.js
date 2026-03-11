import {
    addAssesmentSet,
    getAssesmentSet,
    assetmentTestService
  } from "../services/admin.service.js";
  import { asyncHandler } from "../utils/asyncHandler.js";
  

export const addAssesment = asyncHandler(async (req, res) => {

    const { question , ansOptions } = req.body;

    if (!question || !ansOptions ) {
        return res.status(400).json({
          success: false,
          message: "Please provide question, ansOptions ",
        });
      }
    const users = await addAssesmentSet(req.body);
  
    res.status(200).json({
      success: true,
      data: users,
    });
});

export const getAssesment = asyncHandler(async (req ,res) => {

  const assesment = await getAssesmentSet();

  res.status(200).json({
    success: true,
    count: assesment.length,
    data: assesment,
  });

});

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