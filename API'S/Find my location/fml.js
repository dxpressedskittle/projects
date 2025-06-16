
await fetch('http://ip-api.com/json/?fields=status,message,countryCode')
    .then()
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    var response = JSON.parse(this.responseText)
    console.log(response)
}

xhr.open('get', endpoint, true)
xhr.send()

