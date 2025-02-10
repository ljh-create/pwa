const fs = require("fs");
const path = require("path");

const directories = ["site"];
const outputFile = "site/fileList.json"; // ✅ Netlify 배포를 위해 `site/` 내부에 저장

function getAllFiles(dirPath, fileArray = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, fileArray);
        } else {
            fileArray.push("/" + fullPath.replace(/\\/g, "/").replace("site/", ""));
        }
    });
    return fileArray;
}

// 모든 폴더에서 파일 리스트 가져오기
const allFiles = directories.flatMap(dir => getAllFiles(dir));

// `site/fileList.json`에 저장
fs.writeFileSync(outputFile, JSON.stringify(allFiles, null, 2));
console.log(`✅ 모든 파일이 ${outputFile}에 저장되었습니다.`);
