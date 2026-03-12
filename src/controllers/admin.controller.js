import {
    addAssesmentSet,
    getAssesmentSet
  } from "../services/admin.service.js";
  import { asyncHandler } from "../utils/asyncHandler.js";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

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
