const express = require('express');
const router = express.Router();
const Controller = require('../controllers/ads');
const {  uploadImageSingle } = require('../lib/multer');


router.post('/', uploadImageSingle,   Controller.create); 
router.get("/", Controller.getAll);
router.get('/active', Controller.getAllActive);
router.get('/:id', Controller.get);
router.delete('/:id', Controller.delete);
router.patch("/block/:id", Controller.block);



module.exports = router;
