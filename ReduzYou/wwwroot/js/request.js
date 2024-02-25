const empty_action = (request) => { };

function request(url, method, body, async = true, onLoad = empty_action, failure = empty_action)
{
    const request = new XMLHttpRequest();

    request.open(method, url, async);

    request.onload = () => onLoad(request);
    request.onerror = () => failure(request);

    request.send(body);
}