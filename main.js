var endpoint='http://localhost:8081';
var startTime, endTime;
var processing=false;
$.get(endpoint+'/files/', (data) =>
{
	let listing = loadTree(parseDirectoryListing(data));
	formatArray(listing);
	bindEvents();
});
function loadTree(list){
	var subList=[];
	for(var i=1;i<list.length;i++){
		if(list[i].endsWith("/")){
			var subFolder = getSubFolder(list[i]);
			subList.append(subFolder);
		}
	}
	list.append(subList);
	return list;
}
function getSubFolder(path){
	var ajaxReturn=[];
    jQuery.ajax({
        url: endpoint+path,
        success: function (data) {
            ajaxReturn = loadTree(parseDirectoryListing(data));
        },
        async: false
    });
	return ajaxReturn;
}
Array.prototype.append = function(array)
{
    this.push.apply(this, array)
}
function parseDirectoryListing(text)
{
	let hrefs = text
				 .match(/A\s+(?:[^>]*?\s+)?HREF=(["'])(.*?)\1/g) // pull out the hrefs
				 .map((x) => x.replace('A HREF="', '').replace('"','')); // clean up

	return hrefs;
}

function formatArray(data){
	data.sort();
	data=removeDuplicates(data);
	var indent=0;
	var lastFolder="";
	for(var i=0;i<data.length;i++){
		indent=(data[i].match(/\//g) || []).length*20;
		var item='<div class="item form-check" style="margin-left:'+indent+'px"><input class="form-check-input" type="checkbox" name="file" value="'+data[i]+'">'+decodeURI(data[i])+'</div>';
		$('body').append(item);
	}
	$('body').append('<button type="button" class="btn btn-success btn-download">Download</button>');
}
function removeDuplicates(arr) {
    var obj = {};
    var ret_arr = [];
    for (var i = 0; i < arr.length; i++) {
        obj[arr[i]] = true;
    }
    for (var key in obj) {
        ret_arr.push(key);
    }
    return ret_arr;
}
function bindEvents(){
	$('.item').click(function(){
		var val=$(this).children(":first").val();
		var checked=$(this).children(":first").is(':checked');
		selectByName(val,checked);
	});
  $('.btn-download').click(function(){
    downloadSelected();
  });
}
function selectByName(name,toggle){
	$('.item').each(function(){
		var val=$(this).children(":first").val();
		if(val.startsWith(name)){
			$(this).children(":first").prop('checked', toggle);
		}
	});
}
async function downloadSelected(){
  var checked = $('input:checked');
  for(var i=0;i<checked.length;i++){
    var val=$(checked[i]).val();
    if(!val.endsWith('/')){
      var result = await giveMeASecond(1000);
      download(val,i);
    }
  }
}
function giveMeASecond(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
}
function download(file,idx){
  if(processing){
     download(file,idx);
  }else{
    processing=true;
    downloadElement(file);
    processing=false;
  }
  return idx;
}

function downloadElement(filename) {
  var element = document.createElement('a');
  element.setAttribute('href', filename);
  filename=decodeURI(filename);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
