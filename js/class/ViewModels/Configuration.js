var ConfigurationViewModel = function(){
	//config-schema
	this.activeParticipantColor = ko.observable('#00FFFF');
	this.notActiveParticipantColor = ko.observable('#00000F');
	this.undefinedColor = ko.observable('#0000F0');
	this.subjectColor = ko.observable('#000F00');
	this.processColor = ko.observable('#00F000');
	this.relationColor = ko.observable('#0F0000');
	this.activeConnectionColor = ko.observable('#F00000');
	this.notActiveConnectionColor = ko.observable('#000000');
	this.backgroundColor = ko.observable('#FFFFFF');
	this.strokeWidth = ko.observable(4);
	this.nodeRadius = ko.observable(12);
	
	//config-schema-subscribe
	this.setSubscribes = function(refreshEvent){
		this.activeParticipantColor.subscribe(refreshEvent);
		this.notActiveParticipantColor.subscribe(refreshEvent);
		this.subjectColor.subscribe(refreshEvent);
		this.processColor.subscribe(refreshEvent);
		this.relationColor.subscribe(refreshEvent);
		this.undefinedColor.subscribe(refreshEvent);
		this.activeConnectionColor.subscribe(refreshEvent);
		this.notActiveConnectionColor.subscribe(refreshEvent);
		this.backgroundColor.subscribe(refreshEvent);
		this.strokeWidth.subscribe(refreshEvent);
		this.nodeRadius.subscribe(refreshEvent);
	};
		
	//config-server
	this.hostname = ko.observable('http://localhost:59244');
}