import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createPost() {
    console.log('\x1b[36m%s\x1b[0m', '🖋️  새로운 블로그 글 생성을 시작합니다.');

    const title = await question('제목 (Title): ');
    const description = await question('요약 (Description): ');
    const category = await question('카테고리 (daily/medical/dev/misc) [daily]: ') || 'daily';

    if (!title) {
        console.error('\x1b[31m%s\x1b[0m', '❌ 제목은 필수입니다.');
        process.exit(1);
    }

    const slug = title
        .toLowerCase()
        .trim()
        .replace(/ /g, '-')
        .replace(/[^\w\s-\uAC00-\uD7AF]/g, '');

    const date = new Date().toISOString().split('T')[0];
    const fileName = `${slug}.md`;
    const filePath = path.join(process.cwd(), 'src', 'content', 'blog', fileName);

    const template = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
pubDate: "${date}"
category: "${category}"
---

이곳에 내용을 작성하세요.
`;

    if (fs.existsSync(filePath)) {
        console.error('\x1b[31m%s\x1b[0m', `❌ 이미 존재하는 파일명입니다: ${fileName}`);
        process.exit(1);
    }

    fs.writeFileSync(filePath, template, 'utf8');
    console.log('\x1b[32m%s\x1b[0m', `✅ 파일이 성공적으로 생성되었습니다: ${fileName}`);
    console.log('\x1b[34m%s\x1b[0m', `경로: ${filePath}`);

    rl.close();
}

createPost();
