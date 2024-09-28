
function generateRandomString(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

function addRandomStringToFilename(filename) {
    const randomString = generateRandomString(10); // You can change the length if needed
    const dotIndex = filename.lastIndexOf('.');

    if (dotIndex === -1) {
        return `${filename}_${randomString}`; // If no extension is found, append the random string
    }

    const namePart = filename.slice(0, dotIndex);
    const extension = filename.slice(dotIndex);

    return `${namePart}_${randomString}${extension}`;
}

module.exports = {
    generateRandomString,
    addRandomStringToFilename,
};
