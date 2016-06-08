var AttributeViewModel = function(attribute){
	this.name = ko.observable(attribute.name);
	this.value = ko.observable(attribute.value);
}