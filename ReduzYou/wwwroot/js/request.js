const empty_action = (request) => { };

function request(url, method, body, async = true, success = empty_action, failure = empty_action)
{
    const request = new XMLHttpRequest();

    request.open(method, url, async);

    request.onload = () => success(request);
    request.onerror = () => failure(request);

    request.send(body);
}