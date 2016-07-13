var baseUrl = "http://localhost:3000";

// http://stackoverflow.com/a/5448595
function getParameterValue(key) {
    var result = "",
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === key) result = decodeURIComponent(tmp[1]);
    }
    return result;
}

// http://stackoverflow.com/a/1026087
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
