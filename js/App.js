$(document).ready(function() {
	
	$('#show-reg-btn').on('click',ShowRegistrationForm);
	function ShowRegistrationForm(){
		$('#modal-reg-block').modal();
	};

	$('#register-btn').click(function (e) {
		e.preventDefault();
		shield.registration(
			$('#modal-reg-block__email').val(),
			$('#modal-reg-block__password').val(),
			$('#modal-reg-block__confirm-password').val()
		);
	});

	$('#modal-auth').on('click',ShowAuthForm);
	function ShowAuthForm(){
		$('#modal-auth-block').modal();
	};

	$('#auth-btn').click(function (e) {
		e.preventDefault();
		shield.authorization(
			$('#modal-auth-block__email').val(),
			$('#modal-auth-block__password').val()
		);
	});

	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		switch (e.target.id){
			case 'control-block__bundle-link':
				$('#main_block__bundle-view').show();
				$("#main_block__schema-view").hide();
				$('#main_block__search-view').hide();
				break;
			case 'control-block__schema-link':
				$("#main_block__schema-view").show();
				$('#main_block__bundle-view').hide();
				$('#main_block__search-view').hide();
				break;
			case 'control-block__search-link':
				$('#main_block__schema-view').hide();
				$('#main_block__bundle-view').hide();
				$('#main_block__search-view').show();
				canvas2.Refresh();
				canvas2.Resize();
				break;
		}
	})

	$("#main_block__schema-view").show();
	$('#main_block__bundle-view').hide();
	$('#main_block__search-view').hide();
	
	
    var canvas, canvas2;
	var shield;

	/*ko.bindingHandlers.populateInitialValue = {
		init: function(element, valueAccessor, allBindingsAccessor) {
			var bindings = allBindingsAccessor(),
				options = ko.utils.unwrapObservable(bindings.options),
				optionsValue = bindings.optionsValue,
				value = ko.utils.unwrapObservable(bindings.value),
				initialValue;
			if (options && !options.length) {
				if (optionsValue) {
					initialValue = {};
					initialValue[optionsValue] = value;
				}
				else {
					initialValue = value;   
				}
				console.log(bindings.options());
				bindings.options().push(initialValue);
			}
		}
	};
	*/
	
	function ResizeLeftMenu(init){
		if ($('#control-block').width() < 300) {
			console.log($('#control-block').width());
			$('#pills-menu-modules').addClass('nav-stacked');
			$('#pills-menu-modules').removeClass('nav-justified');
		} else {
				$('#pills-menu-modules').removeClass('nav-stacked');
				$('#pills-menu-modules').addClass('nav-justified');
			}
			
		if ($('#control-block').width() < 330) {
			console.log($('#control-block').width());
			$('#pills-menu-properties').addClass('nav-stacked');
			$('#pills-menu-properties').removeClass('nav-justified');
		} else {
				$('#pills-menu-properties').removeClass('nav-stacked');
				$('#pills-menu-properties').addClass('nav-justified');
			}
		
	}
	
	
	
	
	var MasterVM;
	function AppStart(){
		MasterVM = new MasterViewModel();
		
		canvas = makeCanvasView('main_block__schema-view__canvas', MasterVM);
		canvas.EnableFunctions(false);
		canvas2 = makeCanvasView('main_block__search-view__canvas', MasterVM);
		canvas2.EnableFunctions(true);
		canvas3 = makeCanvasView();
		shield = makeShield();
		
		ko.applyBindings(MasterVM);
		
		window.addEventListener('resize',canvas.Resize,false);
		window.addEventListener('resize', canvas2.Resize, false);
		window.addEventListener('resize', ResizeLeftMenu, false);
		
		document.addEventListener('DOMMouseScroll',canvas.wheel,false);
		$('#main_block__schema-view__controls__delete-selected').bind('click',canvas.RemoveElementEvent);
		ResizeLeftMenu();
		canvas.Resize();
		canvas2.Resize();
		
		MasterVM.situationVM.RefreshEvent = canvas.Refresh;
		MasterVM.configurationVM.setSubscribes(canvas.Refresh);

		MasterVM.bundleVM.changeOntoOpt();
	}

	var MasterViewModel = function(){
		this.selectedItems = ko.observableArray();
		this.selectedConnections = ko.observableArray();
		this.bundleVM = new BundleViewModel(this);
        this.situationVM = new SituationViewModel();
		this.configurationVM = new ConfigurationViewModel();
		this.LoadSituation=function(inJSON){
			this.situationVM.setSituation(JSON.parse(inJSON));
			this.situationVM.RefreshEvent();
		}
	}
	
	function LoadSituation(inJSON){
		MasterVM.situationVM.setSituation(JSON.parse(inJSON));
		canvas.Refresh();
	}
	function LoadSituationEvent(){
		var file = $('#hiddenLoad')[0].files[0];
		var output;
		var reader = new FileReader();
		reader.onload = function (e) {
			output = e.target.result;
			LoadSituation(output);
		}
		reader.readAsText(file);
	}
	$('#hiddenLoadJson').bind('change',LoadSituationEvent);

	
	
	function LoadOntologyEvent(){
		var file = $('#hiddenLoadOntology')[0].files[0];
		MasterVM.bundleVM.importOntology(file);
	}
	$('#hiddenLoadOntology').bind('change',LoadOntologyEvent);
	function LoadOntoBtnEvent(){
		$('#hiddenLoadOntology').click();
	}
	$('#import-ontology-btn').bind('click', LoadOntoBtnEvent);

	function LoadXml_cEvent(){
		var file = $('#hiddenLoadXmlC')[0].files[0];
		MasterVM.bundleVM.importSituationFromConstructor(file);
	}
	$('#hiddenLoadXmlC').bind('change',LoadXml_cEvent);
	function LoadXml_cBtnEvent(){
		$('#hiddenLoadXmlC').click();
	}
	$('#schema-block__controls__load-xml-c-button').bind('click', LoadXml_cBtnEvent);

	function UnloadOntoBtnEvent(){
		MasterVM.bundleVM.unloadOntology();
	}
	$('#unload-ontology-btn').bind('click',UnloadOntoBtnEvent);
	

	function LoadBtnEvent(){
		$('#hiddenLoadJson').click();
	}
	$('#schema-block__controls__load-json-button').bind('click',LoadBtnEvent);

	function SaveSituation(filename, situation){
		var situationInJSON = JSON.stringify(situation);
		var blob = new Blob([situationInJSON],{type: 'text/json'});
		var tmpElement = window.document.createElement('a');
		tmpElement.href = window.URL.createObjectURL(blob);
		tmpElement.download = filename;
		document.body.appendChild(tmpElement);
		tmpElement.click();
		document.body.removeChild(tmpElement);
	}
	function SaveSituationEvent(){
		SaveSituation('schema.json', MasterVM.situationVM.getSituation());
	}
	$('#schema-block__controls__save-json-button').bind('click',SaveSituationEvent);
	$('#schema-block__controls__save-server-button').bind('click',SaveSituationInDbEvent);
	function SaveSituationInDbEvent(){
		MasterVM.bundleVM.SaveSituationToBundle(MasterVM.situationVM.getSituation());
	}
	
	$('#search-block__controls__search-start-button').bind('click', SearchStartEvent);
	function SearchStartEvent(){
		MasterVM.bundleVM.SearchStart(MasterVM.situationVM.getSituation());
	}


	function ClearSituationEvent(){
		MasterVM.situationVM.clear();
		canvas.Refresh();
	};

	$('#schema-block__controls__test-button').bind('click', function(){
		MasterVM.situationVM.getPurposes();
		console.log(MasterVM.situationVM.getClasses('Subject'));
		console.log(MasterVM.situationVM.getClasses('Process'));
		console.log(MasterVM.situationVM.getClasses('Relation'));
	});
	
	
	$('#schema-block__controls__clear-button').bind('click', ClearSituationEvent);

	$('#schema-block__controls__save-button').bind('click',SaveSituationEvent);

	$('#schema-block__options__participant-properties__participant-attributes__add-btn').bind('click',AddAttributeEvent);
	function AddAttributeEvent(){
		MasterVM.situationVM.selectedParticipant().addAttribute({Name:'',Value:''});
	}
	
	//ajax methods
	function ExecuteService(){
		//MasterVM.bundleVM.SendFilter();
        MasterVM.bundleVM.LoadBundle();
	}
	$('#bundle-block__controls__refresh-server-button').bind('click',ExecuteService);
	
	function OpenAutogenEvent(){
		$('#autogen-settings-window').modal();
	}
	$('#bundle-block__controls__tools__autogen').bind('click', OpenAutogenEvent);
	
	
	AppStart();
});
