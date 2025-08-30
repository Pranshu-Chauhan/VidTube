import { Router } from "express";
import { createPlaylist, getUserPlaylists, addVideoToPlaylist,removeVideoFromPlaylist, deletePlaylist, updatePlaylist } from "../controllers/playlist.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/").post(verifyJWT, createPlaylist)

router
    .route("/:playlistId")
    .patch(verifyJWT, updatePlaylist)
    .delete(verifyJWT, deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(verifyJWT, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(verifyJWT, removeVideoFromPlaylist);

router.route("/user/:userId").get(verifyJWT, getUserPlaylists);

export default router