var ParticipantViewModel = function(refreshEvent){
	var self = this;
    this.id = ko.observable('');
	this.name = ko.observable('');
	this.name.subscribe(refreshEvent);
	this.purpose = ko.observable('Undefined');
	this.purpose.subscribe(refreshEvent);
	this.classOf = ko.observable();
	this.attributes = ko.observableArray();
	this.connections = ko.observableArray();
    this.selectedAttribute = ko.observable('');

	this.addAttribute = function(newAttribute){
		this.attributes.push(new AttributeViewModel(newAttribute));
	};

	this.addConnection = function(newConnection){
		this.connections.push(newConnection);
	};

    this.setParticipant = function(participant){
        this.id(participant.id);
        this.name(participant.name);
        this.purpose(participant.purpose);
        this.classOf(participant.classOf);
		participant.attributes.forEach(function(attribute){
			self.addAttribute(attribute);
		});
		participant.connections.forEach(function(connection){
			self.addConnection(connection);
		});
    };

    this.getParticipant = function(){
		var oPar = new Object();
		oPar.id = this.id();
		oPar.name = this.name();
		oPar.purpose = this.purpose();
		oPar.classOf = this.classOf();
		var oldAttributes = [];
		for (var i=0;i<this.attributes().length;i++){
			var oldAttribute = new Object();
			oldAttribute.name = this.attributes()[i].name();
			oldAttribute.value = this.attributes()[i].value();
			oldAttributes[oldAttributes.length] = oldAttribute;
		}
		oPar.attributes = oldAttributes;
		oPar.connections = this.connections();
		return oPar;
	}
}