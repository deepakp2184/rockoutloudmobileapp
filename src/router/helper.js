import RNFetchBlob from 'rn-fetch-blob';
import { PermissionsAndroid, Platform } from 'react-native';
import Share from 'react-native-share';

var RNFS = require('react-native-fs');

export const _doDownload = async (uri) => {
    if (Platform.OS == 'android') {
        try {
            const granted = await PermissionsAndroid.requestPermission(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    'title': 'Storage Permission',
                    'message': 'RockOutLoud wants to use your Storage.'
                }
            )
            if (granted) {
                const { config, fs } = RNFetchBlob
                let date = new Date()
                let PictureDir = fs.dirs.PictureDir // this is the pictures directory. You can check the available directories in the wiki.
                let options = {
                    fileCache: true,
                    addAndroidDownloads: {
                        useDownloadManager: true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
                        notification: true,
                        path: PictureDir + "/PDF_" + Math.floor(date.getTime() + date.getSeconds() / 2) + '.' + extention(uri), // this is the path where your downloaded file will live in
                        description: 'Downloading...'
                    }
                }
                config(options).fetch('GET', uri).then((res) => {
                    alert('Download Successfully.');
                })
            } else {
                console.log("Storage permission denied")
            }
        } catch (err) {
            console.warn(err)
        }
    } else {
        const { config, fs } = RNFetchBlob
        let date = new Date()
        let PictureDir = fs.dirs.PictureDir // this is the pictures directory. You can check the available directories in the wiki.
        let options = {
            fileCache: true,
            addAndroidDownloads: {
                useDownloadManager: true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
                notification: true,
                path: PictureDir + "/PDF_" + Math.floor(date.getTime() + date.getSeconds() / 2) + '.' + (extention(uri) == undefined ? 'pdf' : extention(uri)), // this is the path where your downloaded file will live in
                description: 'Downloading...'
            }
        }
        config(options).fetch('GET', uri).then((res) => {
            alert('Download Successfully.');
        })
    }
}

const extention = (filename) => {
    return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
}

export const _doMoveFile = (path) => {
    let date = new Date()
    var destPath = RNFS.DocumentDirectoryPath + "/Image_" + Math.floor(date.getSeconds() / 2) + '.' + extention(path);
    console.log(destPath);
    RNFS.writeFile(destPath, path, 'base64')
        .then((success) => {
            console.log('FILE WRITTEN!' + success);
        })
        .catch((err) => {
            console.log(err.message);
        });
}

export const _doShare = (path, type) => {
    if(type == 'png') {
        Share.open({
            type: 'image/png',
            url: path
        });
    }else {
        Share.open({
            type: 'application/pdf',
            url: (Platform.OS === 'android' ? 'file://' + path : path)
        });
    }
}