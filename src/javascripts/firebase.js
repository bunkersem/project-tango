// Initialize Firebase
var config = {
    apiKey: "AIzaSyArqVRzXyZq-NqLh-RC22ztS04VPAM9XzU",
    authDomain: "tango-deec9.firebaseapp.com",
    databaseURL: "https://tango-deec9.firebaseio.com",
    projectId: "tango-deec9",
    storageBucket: "tango-deec9.appspot.com",
    messagingSenderId: "946389181342"
};
firebase.initializeApp(config);

var storage = firebase.storage();
var imagesRef = storage.ref('images/articles');

function getImage(fileName, callback){
    var imgRef = imagesRef.child(fileName);
    imgRef.getDownloadURL().then(function(url){
        callback(undefined, url);
    }).catch(function(err){
        callback(err);
    })
}