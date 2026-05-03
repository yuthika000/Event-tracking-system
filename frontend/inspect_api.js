import fetch from 'node-fetch';
import fs from 'fs';

async function check() {
    try {
        const res = await fetch('http://localhost:8080/api/leave/all');
        const data = await res.json();
        fs.writeFileSync('api_response.json', JSON.stringify(data, null, 2));
        console.log("Done");
    } catch (e) {
        console.error(e);
    }
}

check();
