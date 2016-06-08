var BundleViewModel = function(parent){
	var self = this;
	var testAnswerModel = [
		{ id:'10416962', name:'13.2', type:'Rule',  rate:'0.79'},
		{ id:'11234564', name:'13.1', type:'Rule', rate:'0.71'}
	];
	this.filterName = ko.observable('');
	this.filterType = ko.observable('');
	this.filterDate = ko.observable('');
    this.schemaBundle = ko.observableArray('');
	this.answerBundle = ko.observableArray('');

	this.ontologyName = ko.observable('No ontology');


	this.changeOntoOpt = function(){
		//if (self.ontologyName()=="No ontology"){
		//	$('.onto-text').show();
//
		//	var element = $('.onto-select');
		//	element.hide();
		//	ko.cleanNode(element[0]);
		//	ko.cleanNode(element[1]);
		//	ko.cleanNode(element[2]);
		//}
		//else {
		//	$('.onto-text').hide();
		//	//ko.cleanNode(element);
//
		//	var element = $('.onto-select');
		//	element.show();
		//	ko.applyBindings(MasterVM,element[0]);
		//	ko.applyBindings(MasterVM,element[1]);
		//	ko.applyBindings(MasterVM,element[2]);
		//}
	}


	this.importSituationFromConstructor = function(file){
		var data = new FormData();
		data.append('file',file);

		$.ajax({
			type: "POST",
			url: parent.configurationVM.hostname()+'/api/situations/PostFromConstructor',
			contentType: false,
			processData: false,
			data: data,
			success: function (response) {
				parent.LoadSituation(JSON.stringify(response));
			},
			error: function (xhr, status, p3) {
				alert('BAD FAILED');
				$("#hiddenLoadXmlC").val("");
			}
		});
	}

	this.importOntology = function(file){
		var data = new FormData();
		data.append('file',file);
		
		self.ontologyName('Ontology loaded: '+file.name)
		self.changeOntoOpt();
		//$.ajax({
		//	type: "POST",
		//	url: parent.configurationVM.hostname()+'/api/ontology/post',
		//	contentType: false,
		//	processData: false,
		//	data: data,
		//	success: function (result) {
		//		self.ontologyName('Ontology loaded: '+file.name);
		//		//ontology integration
		//	},
		//	error: function (xhr, status, p3) {
		//		self.ontologyName('No ontology');
		//		$("#hiddenLoadOntology").val("");
		//	}
		//});
	};
	
	this.exportOntology = function(){
		
	};
	
	this.unloadOntology = function(){
		self.ontologyName('No ontology');
		self.changeOntoOpt();
	};
	
	

	this.sourceBase = ko.observable('database');

	this.UploadOntology = function(file){
		
	}
	

    this.LoadBundle = function(){
		var sourceType = false;
		if (self.sourceBase()=='database')
			sourceType=false;
		else
			sourceType=true;
		var filter = { name: self.filterName(), type: self.filterType(), date: self.filterDate(), sourceType: sourceType};

		$.ajax({
			type: "POST",
			data :JSON.stringify(filter),
			url: parent.configurationVM.hostname()+'/api/situations/GetAllSituations/',
			contentType: "application/json",
			success: function(response){
				self.schemaBundle(response);
			}
		});
        //var uri = parent.configurationVM.hostname()+'/api/situations/GetAllSituations/';
		//$.getJSON(uri).done(function(data) {
		//	self.schemaBundle(data)
		//});
	};

	this.SendFilter = function(){
		var sourceType = false;
		if (self.sourceBase()=='database')
			sourceType=false;
		else
			sourceType=true;
		var filter = { name: self.filterName(), type: self.filterType(), date: self.filterDate(), sourceType: sourceType};
		$.ajax({
			type: "POST",
			data :JSON.stringify(filter),
			url: parent.configurationVM.hostname()+"/api/situations/SetFilter",
			contentType: "application/json",
			success: function(response){
				alert(response);
			}
		});
	}

    this.SaveSituationToBundle = function(situation){
		$.ajax({
			type: "POST",
			data :JSON.stringify(situation),
			url: parent.configurationVM.hostname()+"/api/situations/post",
			contentType: "application/json",
			success: function(response){
				alert('Saved id: '+response);
			}
		});
    };
	
    this.LoadSituationFromBundle = function(element){
		var id = element.id;
		var sourceType = false;
		if (self.sourceBase()=='database')
			sourceType=false;
		else
			sourceType=true;
		$.ajax({
			type: "POST",
			data :JSON.stringify({sourceType: sourceType, id: id}),
			url: parent.configurationVM.hostname()+'/api/situations/GetSituation',
			contentType: "application/json",
			success: function(response){
				parent.LoadSituation(JSON.stringify(response));
			}
		});
        //$.getJSON(parent.configurationVM.hostname()+'/api/situations/GetSituation' + '/' + id)
		//	.done(function (data) {
		//		parent.LoadSituation(JSON.stringify(data));
		//	})
		//	.fail(function (jqXHR, textStatus, err) {
		//			console.log(err);
		//	});
	};

	this.LoadSituationToPreview = function(element){
		var id = element.id;
		$.getJSON(parent.configurationVM.hostname()+'/api/situations' + '/' + id)
			.done(function (data) {
				parent.LoadSituation(JSON.stringify(data));
			})
			.fail(function (jqXHR, textStatus, err) {
				console.log(err);
			});
	};
	
	this.LoadSituationFromBundleWithCoordinates = function(element){
		var id = element.id;
		var data = "{'idInJson' : '"+ JSON.stringify(id)+"' }"
		$.ajax({
			type: "POST",
			url: "http://localhost:52004/LTCBR.asmx/GetOneSituationNewCoordinate",
			data: data,
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			context: this,
			success: function (response) {
				LoadSituation(response.d);
			},
			failure: function (response) {
				console.log('Fail');
			}
		});
	};
	
	this.SearchStart = function(situationIn) {
		self.answerBundle(testAnswerModel);
		/*$.ajax({
			type: "POST",
			data: JSON.stringify(situationIn),
			url: parent.configurationVM.hostname() + '/api/search/post',
			contentType: "application/json",
			success: function (response) {
				alert(response);
				console.log(testAnswerModel);
				console.log(response);
				self.answerBundle(response);
			}
		});*/
	};
};
