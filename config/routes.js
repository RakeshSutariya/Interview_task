const express = require('express');
const router = express.Router();

let UserController = require('../controllers/UserController');
router.get('/registration', UserController.registerPage);
router.post('/user/register', UserController.registerUser);
router.get('/', UserController.loginPage);
router.post('/user/login', UserController.login);

let PlayerController = require('../controllers/PlayerController');
router.get('/player', PlayerController.openMusicPlayer);
router.get('/play/song/list', PlayerController.playSongList);
router.get('/music', PlayerController.musicPage);
router.post('/music/list', PlayerController.getAllMusic);
router.get('/music/addPage', PlayerController.musicAddPage);
router.post('/music/add', PlayerController.musicFile);
router.delete('/music/delete', PlayerController.musicDelete);
router.get('/music/updatePage', PlayerController.musicEditPage);
router.post('/get/music', PlayerController.getMusic);
router.patch('/music/update', PlayerController.musicUpdate);

module.exports = router;