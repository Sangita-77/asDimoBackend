import { asyncHandler } from "../utils/asyncHandler.js";
import * as gamesService from "../services/games.service.js";

export const createGame = asyncHandler(async (req, res) => {
  const game = await gamesService.createGame(req.body);
  res.status(201).json({
    success: true,
    message: "Game created successfully",
    data: game,
  });
});

export const getGames = asyncHandler(async (req, res) => {
  const games = await gamesService.getGames();
  res.status(200).json({
    success: true,
    message: "Games retrieved successfully",
    data: games,
  });
});

export const getGameById = asyncHandler(async (req, res) => {
  const game = await gamesService.getGameById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Game details retrieved successfully",
    data: game,
  });
});

export const updateGameById = asyncHandler(async (req, res) => {
  const game = await gamesService.updateGameById(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Game updated successfully",
    data: game,
  });
});

export const updateGameStatus = asyncHandler(async (req, res) => {
  const game = await gamesService.updateGameStatus(req.params.id, req.body.status);
  res.status(200).json({
    success: true,
    message: "Game status updated successfully",
    data: game,
  });
});

export const deleteGameById = asyncHandler(async (req, res) => {
  const game = await gamesService.deleteGameById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Game deleted successfully",
    data: game,
  });
});

export const playGame = asyncHandler(async (req, res) => {
  const session = await gamesService.playGame(req.body);
  res.status(200).json({
    success: true,
    message: "Game session started successfully",
    data: session,
  });
});

export const completeGame = asyncHandler(async (req, res) => {
  const session = await gamesService.completeGame(req.body);
  res.status(200).json({
    success: true,
    message: "Game completed successfully",
    data: session,
  });
});

export const getGameHistory = asyncHandler(async (req, res) => {
  const history = await gamesService.getGameHistory(req.params.studentId);
  res.status(200).json({
    success: true,
    message: "Game history retrieved successfully",
    data: history,
  });
});
