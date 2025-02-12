const fs = require("fs");
const path = require("path");

const siteDirectory = "site";
const outputFile = path.join(siteDirectory, "fileList.json");

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
            const relativePath = "/" + fullPath.replace(/\\/g, "/").replace("site/", "");
            fileArray.push(relativePath);
        }
    });
    return fileArray;
}

const allFiles = getAllFiles(siteDirectory);

// ✅ `404.html`, `Chapter3/` 관련 파일 강제 추가 (오프라인에서 정상 동작 보장)
if (!allFiles.includes("/404.html") && fs.existsSync(path.join(siteDirectory, "404.html"))) {
    allFiles.push("/404.html");
}
allFiles.forEach(file => {
    if (file.startsWith("/Chapter3/") && !allFiles.includes(file)) {
        allFiles.push(file);
    }
});

fs.writeFileSync(outputFile, JSON.stringify(allFiles, null, 2));

console.log(`✅ fileList.json이 성공적으로 생성되었습니다! (${outputFile})`);
