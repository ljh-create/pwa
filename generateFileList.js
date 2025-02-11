const fs = require("fs");
const path = require("path");

const directories = ["site"];
const outputFile = "site/fileList.json";

function getAllFiles(dirPath, fileArray = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, fileArray);
        } else {
            // ✅ 파일 경로를 소문자로 변환
            fileArray.push("/" + fullPath.replace(/\\/g, "/").replace("site/", "").toLowerCase());
        }
    });
    return fileArray;
}

// 파일이 존재하는지 확인 후 저장
const allFiles = directories.flatMap(dir => getAllFiles(dir)).filter(file => fs.existsSync("site" + file));

fs.writeFileSync(outputFile, JSON.stringify(allFiles, null, 2));
console.log(`✅ 모든 파일이 ${outputFile}에 저장되었습니다.`);
