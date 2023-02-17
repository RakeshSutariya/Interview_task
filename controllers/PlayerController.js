const path = require('path');
const moment = require('moment');
const musicMaster = require('../models/music');
var mongoose = require('mongoose');
const fs = require('fs');

async function getMusicData(whereCondtion){
    return await musicMaster.find(whereCondtion);
}

async function removeFile(filePath){
    let FileDest = path.resolve(filePath);
    fs.unlink(FileDest, (err) => {
        if (err) {
           return false
        }else{
            return true;
        }
    });
}

module.exports = {
    async openMusicPlayer(req, res){
        return res.render('player');
    },

    async musicPage(req, res){
        return res.render('music_list');
    },

    async musicAddPage(req, res){
        return res.render('add_music');
    },

    async getAllMusic(req, res){
        var draw = req.body.draw;
        var row = req.body.start;
        var rowperpage = req.body.length;  
        let dataArr = []; 
        let getSong = await musicMaster.find({ 'user_id': req.body.id });
        for (var i = row; i < getSong.length; i++) 
        {
            if(dataArr.length < rowperpage){
                dataArr.push({
                    'id': getSong[i]._id.toString(),
                    'song_name': getSong[i].song_name,
                    'artist_name': getSong[i].artist_name,
                    'music_path': getSong[i].music_path,
                    'images_path': getSong[i].images_path,
                    'created_at': getSong[i].created_at,
                    'updated_at': getSong[i].updated_at,
                    'action' : "<div class='dropdown' style='margin-right: 77px !important;'><button onclick='myFunction()' class='dropbtn actionButton'>Action</button><div id='myDropdown' class='dropdown-content'><div><button type='button' class='btn btn-light' onclick='editSong("+i+")' id='editSongs"+i+"'  data-id='"+getSong[i]._id.toString()+"' style='padding-left33px !important; padding-right: 33px !important;'><i class='fa fa-edit' aria-hidden='true'><span style='padding-left : 10px !important;font-weight: 400 !important;cursor: pointer !important;'>EDIT</span></i></button></div><div><button type='button' class='btn btn-light' onclick='deleteSong("+i+")' id='deleteSongs"+i+"' data-id='"+getSong[i]._id.toString()+"' style='padding-left33px !important; padding-right: 33px !important;'><i class='fa fa-trash' aria-hidden='true'><span style='padding-left : 10px !important;font-weight: 400 !important;cursor: pointer !important;'>DELETE</span></i></button></div></div></div>"
                });
            }
        }
        var response = {
            "draw" : draw,
            "iTotalRecords" : getSong.length,
            "iTotalDisplayRecords" : getSong.length,
            "aaData" : dataArr
        };
        res.send(response);
        return response;
    },

    async musicFile(req, res){
        try{
            res.setHeader("Content-Type", "text/json");
            let response = { 'statusCode' : 1000 };
            let params = req.body;
            let imageName = "";
            let musicName = "";

            if(
                req.files && 
                params.id && params.id.trim() != '' && 
                params.userName && params.userName.trim() != '' && 
                params.songName && params.songName.trim() != '' && 
                params.artist && params.artist.trim() != ''
            ){
                let imageData = req.files.images;
                imageName = imageData.name;
                imageName = imageName.replace(/\s/g, "");
                let ImageSize = imageData.size;
                let imageExtantion = imageName.split('.');

                let musicData = req.files.musics;
                musicName = musicData.name;
                musicName = musicName.replace(/\s/g, "");
                let musicSize = musicData.size;
                let musicExtantion = musicName.split('.');

                if(ImageSize >= 3000000){
                    return res.json({ 'statusCode' : 1003 }); // Image upload maximum size of 3 MB
                }

                if(musicSize >= 10000000){
                    return res.json({ 'statusCode' : 1004 }); // Music upload maximum size of 10 MB
                }

                let getMusic = await getMusicData({ "$or": [{ 'music_path': musicName }, { 'images_path': imageName }] });

                if(getMusic.length > 0){
                    return res.json({ 'statusCode' : 1005 }); // Already Exist Song Or Image
                }

                if(imageExtantion[imageExtantion.length - 1] == 'jpeg' || imageExtantion[imageExtantion.length - 1] == 'jpg' || imageExtantion[imageExtantion.length - 1] == 'png'){
                    let imageDest = path.resolve(`./public/images/${imageName}`);
                    imageData.mv(imageDest, function(err){
                        if(err){
                            return res.json({ 'statusCode' : 1006 }); // Image Upload Failled
                        }
                    });
                }else{
                    return res.json({ 'statusCode' : 1007 }); // Image Format Not Match
                }

                if(musicExtantion[musicExtantion.length - 1] == 'mp3'){
                    let musicDest = path.resolve(`./public/song/${musicName}`);
                    musicData.mv(musicDest, function(err){
                        if(err){
                            return res.json({ 'statusCode' : 1008 }); // Music Upload Failled
                        }
                    });
                }else{
                    return res.json({ 'statusCode' : 1009 }); // Format Not Match
                }

                await musicMaster.create({
                    user_id: params.id,
                    user_name: params.userName,
                    song_name: params.songName,
                    artist_name: params.artist,
                    images_path: imageName,
                    music_path: musicName,
                    created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                });

                response = { 'statusCode' : 200 }; 
            }

            return res.json(response);
        }catch(err){
            return res.json({ 'statusCode' : 500 });
        }
    },

    async musicDelete(req, res){
        try{
            let params = req.body;
            let response = { 'statusCode': 1000 };
            if (params.id != undefined && params.id.trim() != '') {
                let getMusic = await getMusicData({
                    '_id': mongoose.Types.ObjectId(params.id)
                });

                if(getMusic.length > 0){
                    await removeFile(`./public/images/${getMusic[0].images_path}`);
                    await removeFile(`./public/song/${getMusic[0].music_path}`);
                    await musicMaster.deleteOne({
                        '_id': mongoose.Types.ObjectId(params.id)
                    });
                    response = { 'statusCode': 200};
                }else{
                    response = { 'statusCode': 1010 }; //Song not found
                }
            }
            return res.json(response);
        }catch(error){
            return res.json({"statusCode": 500 });
        }
    },

    async musicEditPage(req, res){
        return res.render('update_music');
    },
    async getMusic(req, res){
        try{
            let params = req.body;
            let response = { 'statusCode': 1000 };
            if (params.songId != undefined && params.songId.trim() != '') {
                let getMusic = await getMusicData({
                    '_id': mongoose.Types.ObjectId(params.songId)
                });

                if(getMusic.length > 0){
                    response = { 'statusCode': 200, data : getMusic[0]};
                }else{
                    response = { 'statusCode': 1010 }; //Song not found
                }
            }
            return res.json(response);
        }catch(error){
            return res.json({"statusCode": 500 });
        }
    },
    
    async musicUpdate(req, res){
        try{
            res.setHeader("Content-Type", "text/json");
            let response = { 'statusCode' : 1000 };
            let params = req.body;
            let imageName = "";
            let musicName = "";

            if(
                params.songId && params.songId.trim() != ''
            ){
                let whereCondtion = {updated_at: moment().format("YYYY-MM-DD HH:mm:ss")};
                let getMusic = await getMusicData({
                    '_id': mongoose.Types.ObjectId(params.songId)
                });

                if(params.songName && params.songName.trim() != ''){
                    whereCondtion.song_name = params.songName;
                }

                if(params.artist && params.artist.trim() != ''){
                    whereCondtion.artist_name = params.artist;
                }
                let checkImageUpload = true;
                if(params.images === 'undefined'){
                    checkImageUpload = false;
                }
                if(checkImageUpload){
                    let imageData = req.files.images;
                    imageName = imageData.name;
                    imageName = imageName.replace(/\s/g, "");
                    let checkImages = await getMusicData({ 'music_path': musicName , 'images_path': imageName });

                    if(checkImages.length > 0){
                        return res.json({ 'statusCode' : 1005 }); // Already Exist Image
                    }

                    if(getMusic.length > 0){
                        await removeFile(`./public/images/${getMusic[0].images_path}`);
                    }
                    let ImageSize = imageData.size;
                    let imageExtantion = imageName.split('.');
                    if(ImageSize >= 3000000){
                        return res.json({ 'statusCode' : 1003 }); // Image upload maximum size of 3 MB
                    }

                    if(imageExtantion[imageExtantion.length - 1] == 'jpeg' || imageExtantion[imageExtantion.length - 1] == 'jpg' || imageExtantion[imageExtantion.length - 1] == 'png'){
                        let imageDest = path.resolve(`./public/images/${imageName}`);
                        imageData.mv(imageDest, function(err){
                            if(err){
                                return res.json({ 'statusCode' : 1006 }); // Image Upload Failled
                            }
                        });
                    }else{
                        return res.json({ 'statusCode' : 1007 }); // Image Format Not Match
                    }
                    whereCondtion.images_path = imageName;
                }
                let checkMusicUpload = true;
                if(params.musics === 'undefined'){
                    checkMusicUpload = false;
                }
                if(checkMusicUpload != ''){
                    let musicData = req.files.musics;
                    musicName = musicData.name;
                    musicName = musicName.replace(/\s/g, "");

                    let checkMusic = await getMusicData({ 'music_path': musicName });

                    if(checkMusic.length > 0){
                        return res.json({ 'statusCode' : 1011 }); // Already Exist Song
                    }
                    if(getMusic.length > 0){
                        await removeFile(`./public/song/${getMusic[0].music_path}`);
                    }
                    let musicSize = musicData.size;
                    let musicExtantion = musicName.split('.');

                    if(musicSize >= 10000000){
                        return res.json({ 'statusCode' : 1004 }); // Music upload maximum size of 10 MB
                    }

                    if(musicExtantion[musicExtantion.length - 1] == 'mp3'){
                        let musicDest = path.resolve(`./public/song/${musicName}`);
                        musicData.mv(musicDest, function(err){
                            if(err){
                                return res.json({ 'statusCode' : 1008 }); // Music Upload Failled
                            }
                        });
                    }else{
                        return res.json({ 'statusCode' : 1009 }); // Format Not Match
                    }
                    whereCondtion.music_path = musicName;
                }
                await musicMaster.updateOne({'_id': mongoose.Types.ObjectId(params.songId)},  { "$set" : whereCondtion} );

                response = { 'statusCode' : 200 }; 
            }

            return res.json(response);
        }catch(err){
            return res.json({ 'statusCode' : 500 });
        }
    },

    async playSongList(req, res){
        let allMusic =  await musicMaster.find({},['song_name', 'artist_name', 'images_path', 'music_path']);
        return res.json(allMusic);
        
    }
}