const fs = require('fs');
const path = require('path');


function callback (data) {
    return data.toString()
}


// function to to read a file
const readFileAsync = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if(err) return reject(err);
            return resolve(callback(data))
        })
    })
}

(() => {
    readFileAsync(filePath).then(console.log).catch(console.error)
})