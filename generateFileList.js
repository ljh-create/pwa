const fs = require("fs");
const path = require("path");

const directories = ["site"]; // ✅ MkDocs가 빌드한 정적 파일이 있는 폴더
const outputFile = "fileList.json"; // ✅ 생성할 JSON 파일

// 특정 디렉토리 내의 모든 파일을 검색하여 리스트업
function getAllFiles(dirPath, fileArray = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, fileArray);
        } else {
            fileArray.push("/" + fullPath.replace(/\\/g, "/"));
        }
    });
    return fileArray;
}

// 모든 폴더에서 파일 리스트 가져오기
const allFiles = directories.flatMap(dir => getAllFiles(dir));

// 파일 리스트를 JSON으로 저장
fs.writeFileSync(outputFile, JSON.stringify(allFiles, null, 2));
console.log(`✅ 모든 파일이 ${outputFile}에 저장되었습니다.`);
