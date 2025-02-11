const fs = require("fs");
const path = require("path");

const siteDirectory = "site"; // ✅ site 폴더 지정
const outputFile = path.join(siteDirectory, "fileList.json"); // ✅ site 폴더 내에서 생성

// ✅ site 폴더가 존재하는지 확인 후 없으면 생성
if (!fs.existsSync(siteDirectory)) {
    console.error("❌ site 폴더가 존재하지 않습니다! MkDocs 빌드가 완료되었는지 확인하세요.");
    process.exit(1);
}

function getAllFiles(dirPath, fileArray = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, fileArray);
        } else {
            // ✅ 경로를 정리하여 리스트에 추가
            const relativePath = "/" + fullPath.replace(/\\/g, "/").replace("site/", "");
            fileArray.push(relativePath);
        }
    });
    return fileArray;
}

// ✅ site 폴더 내 모든 파일 가져오기
const allFiles = getAllFiles(siteDirectory);

// ✅ JSON 파일 생성 및 저장
fs.writeFileSync(outputFile, JSON.stringify(allFiles, null, 2));

console.log(`✅ fileList.json이 성공적으로 생성되었습니다! (${outputFile})`);
