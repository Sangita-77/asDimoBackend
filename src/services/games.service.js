import Game from "../models/game.model.js";
import GameSession from "../models/gameSession.model.js";

export const createGame = async (data) => {
  const game = await Game.create(data);
  return game;
};

export const getGames = async () => {
  return await Game.find();
};

export const getGameById = async (id) => {
  const game = await Game.findById(id);
  if (!game) {
    const error = new Error("Game not found");
    error.statusCode = 404;
    throw error;
  }
  return game;
};

export const updateGameById = async (id, data) => {
  const game = await Game.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!game) {
    const error = new Error("Game not found");
    error.statusCode = 404;
    throw error;
  }
  return game;
};

export const updateGameStatus = async (id, status) => {
  const game = await Game.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  if (!game) {
    const error = new Error("Game not found");
    error.statusCode = 404;
    throw error;
  }
  return game;
};

export const deleteGameById = async (id) => {
  const game = await Game.findByIdAndDelete(id);
  if (!game) {
    const error = new Error("Game not found");
    error.statusCode = 404;
    throw error;
  }
  return game;
};

export const playGame = async (data) => {
  const session = await GameSession.create({
    studentId: data.studentId,
    gameId: data.gameId,
    status: "started",
  });
  return session;
};

export const completeGame = async (data) => {
  const session = await GameSession.findOneAndUpdate(
    { studentId: data.studentId, gameId: data.gameId, status: "started" },
    { status: "completed", score: data.score || 0 },
    { new: true }
  );
  if (!session) {
    const error = new Error("Game session not found");
    error.statusCode = 404;
    throw error;
  }
  return session;
};

export const getGameHistory = async (studentId) => {
  return await GameSession.find({ studentId: Number(studentId) });
};