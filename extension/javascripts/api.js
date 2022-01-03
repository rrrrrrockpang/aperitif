/**
 * Call backend API that uses Tea. 
 * See backend server code in Flask
 * Could change the API URL for your own usage
 * @returns 
 */

API_URL = "http://localhost:5555/getMethod"

const decide_method = async () =>{
    const response = await fetch(API_URL, {
            method: "POST",
            mode: 'cors',
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin',
            body: JSON.stringify(teaCode)
    });

    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }

    let result = await response.json();
    return result;
}


async function createRecord(url, data) {
    console.log(data);
    const response = await fetch(url, {
        method: "PUT",
        mode: 'cors',
        cache: 'no-cache', 
        credentials: 'same-origin',
        body: JSON.stringify(data)
    });
    return response.json();
}


async function postData(url, data) {
    console.log(data);
    const response = await fetch(url, {
        method: "POST",
        mode: 'cors',
        cache: 'no-cache', 
        credentials: 'same-origin',
        body: JSON.stringify(data)
    });

    return response.json();
}

