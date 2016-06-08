var SituationViewModel = function(){
	this.RefreshEvent='';
	
	function TreeView(data, propMap){
		var treeView = this;
		this.data = data;
		this.selectedNode = ko.observable();
		this.children = ko.computed(function(){
			return dataByPurposes(ko.utils.unwrapObservable(data));
		});
		setIsLast(this.children());
		this.children.subscribe(function(newVal){
			setIsLast(newVal);
		});

		function dataByPurposes(dataArray,old){
			var res = [];
			res.push(new TreeViewNode(new CreateCategory('Subjects'),'name'));
			res[0].children=ko.observable([]);
			res.push(new TreeViewNode(new CreateCategory('Proceses'),'name'));
			res[1].children=ko.observable([]);
			res.push(new TreeViewNode(new CreateCategory('Relations'),'name'));
			res[2].children=ko.observable([]);
			res.push(new TreeViewNode(new CreateCategory('Undefined'),'name'));
			res[3].children=ko.observable([]);
			for(var i=0,l=dataArray.length;i<l;i++){
				switch (dataArray[i].purpose()) {
					case 'Subject':
						res[0].children().push(dataArray[i]._treeviewNode || new TreeViewNode(dataArray[i],'pName'));
						res[0] = DoneList(res[0]);
						break;
					case 'Process':
						res[1].children().push(dataArray[i]._treeviewNode || new TreeViewNode(dataArray[i],'pName'));
						res[1] = DoneList(res[1]);
						break;
					case 'Relation':
						res[2].children().push(dataArray[i]._treeviewNode || new TreeViewNode(dataArray[i],'pName'));
						res[2] = DoneList(res[2]);
						break;
					default:
						res[3].children().push(dataArray[i]._treeviewNode || new TreeViewNode(dataArray[i],'pName'));
						res[3] = DoneList(res[3]);
				}
			}
			return res;
		}

		function dataByParticipants(dataArray, old){
			var res = [];
			res.push(new TreeViewNode(dataArray.classOf(),'class'));
			res[0].children=ko.observableArray([]);
			res.push(new TreeViewNode(new CreateCategory('Attributes'),'name'));
			res[1].children=ko.observableArray([]);
			for(var i=0,l=dataArray.attributes().length;i<l;i++){
				res[1].children().push(dataArray.attributes()[i]._treeviewNode || new TreeViewNode(dataArray.attributes()[i],'attribute'));
			}
			res[1] = DoneList(res[1]);
			res.push(new TreeViewNode(new CreateCategory('Connections'),'name'));
			res[2].children=ko.observableArray([]);
			for(var i=0,l=dataArray.connections().length;i<l;i++)
				res[2].children().push(dataArray.connections()[i]._treeviewNode || new TreeViewNode(dataArray.connections()[i]));
			res[2] = DoneList(res[2]);
			return res;
		}

		function setIsLast(children){
			for(var i=0,l=children.length;i<l;i++)
				children[i].isLast(i==(l-1));
		}

		function CreateCategory(name){
			this.name = ko.observable(name);
			this.list = ko.observableArray();
		}

		function DoneList(list){
			list.isOpen = ko.observable();
			list.isClosed = ko.computed(function(){
				return !list.isOpen();
			},list);
			list.isLeaf = ko.computed(function(){
				return !(list.children && list.children().length);
			},list);
			list.isLast = ko.observable(false);
			if (list.children){
				setIsLast(list.children());
				list.children.subscribe(function(newVal){
					setIsLast(newVal);
				});
			}
			list.toggleOpen = function(){
				list.isOpen(!list.isOpen());
			};
			list.isSelected = ko.computed(function(){
				return (treeView.selectedNode()===list)
			},list);
			list.toggleSelection = function(){
				if(list.isSelected())
					treeView.selectedNode(null);
				else
					treeView.selectedNode(list);
			}
			return list;
		}

		function TreeViewNode(data, field){
			var self = this;
			if (data==undefined)
				data='';
			this.data = data;
			data._treeviewNode = this;
			var map = (typeof propMap == 'function') ? propMap(data):propMap;
				captionProp = (map && map.caption)||'caption',
				childrenProp = (map && map.children)||'children';
			switch (field) {
				case 'name':
					this.caption = data['name'];
					break;
				case 'attribute':
					this.caption = ko.computed(function(){
						return data['name']()+':'+data['value']();
					});
					break;
				case 'class':
					this.caption = 'Class: ' + data;
					break;
				case 'pName':
					this.caption = ko.computed(function(){
						 return '#' + data['id']()+' '+data['name']();
					});
					break;
				default:
					this.caption = data;
			}
			if(data[childrenProp])
				this.children = ko.computed(function(){
					return dataByParticipants(ko.utils.unwrapObservable(data));
				});
			else
				this.children = null;
			this.isOpen = ko.observable();
			this.isClosed = ko.computed(function(){
				return !this.isOpen();
			},this);
			this.isLeaf = ko.computed(function(){
				return !(this.children && this.children().length);
			},this);
			this.isLast = ko.observable(false);
			if (this.children){
				setIsLast(this.children());
				this.children.subscribe(function(newVal){
					setIsLast(newVal);
				});
			}
			this.toggleOpen = function(){
				self.isOpen(!self.isOpen());
			};
			this.isSelected = ko.computed(function(){
				return (treeView.selectedNode()===this)
			},this);
			this.toggleSelection = function(){
				if(this.isSelected())
					treeView.selectedNode(null);
				else {
					var currentId = this.data.id();
					Select(currentId);
					treeView.selectedNode(this);
				}
			}
		}
	}
		
	var self = this;

	this.removeAttribute = function(e){
		self.selectedParticipant().attributes.remove(e);
	}.bind(this);

    this.name = ko.observable("");
	this.type = ko.observable("");
	this.description = ko.observable("");
	this.solution = ko.observable("");

	var classToSubject = ['Road','Sign','Environment','PublicStop', 'Crossroad', 'Pedestrian','Crosswalk','Lane','Marking','Pointsman','TrafficLight','Transport'];
	
	this.classHierarchy =	ko.observableArray([
								{
									name: 'Process',
									parent: '',
									attributes: []
								},
								{	
									name: 'Subject', 
									parent: '',
									attributes: []
								},
								{	
									name: 'Relation', 
									parent: '',
									attributes: []
								},
								{
									name: 'Transport',
									parent: 'Subject',
									attributes: 	[	
														{	
															name:'kakakkakaka',
															value: '2'
														}
													]
								},
								{
									name: 'Road',
									parent: 'Subject',
									attributes: 	[	
														{	
															name:'1', 
															value: '2'
														}
													]
								},
								{
									name: 'Sign',
									parent: 'Subject',
									attributes: 	[	
														{	
															name:'1', 
															value: '2'
														}
													]
								},
								{
									name: 'Polozhenie',
									parent: 'Relation',
									attributes: 	[	
														{	
															name:'1', 
															value: '2'
														},
														{	
															name:'3', 
															value: '4'
														},
														{	
															name:'5', 
															value: '6'
														}
													]
								},
								{
									name: 'Movement',
									parent: 'Process',
									attributes: 	[	
														{	
															name:'1', 
															value: '2'
														}
													]
								}
							]);
	
	this.coordinates = [];

	this.selectedParticipant = ko.observable('');

	this.participants = ko.observableArray();
	
	
	this.getPurposes = function(){
		var purposes = [];
		for (var i=0; i<this.classHierarchy.length; i++){
			if (this.classHierarchy[i].parent.length=='')
				purposes[purposes.length] = this.classHierarchy[i].name;
		}
		console.log(purposes);
	}
	
	
	this.availableClasses = ko.observableArray();
	this.availableAttributes = ko.observableArray();
	
	this.allConnections = ko.observable(0);
	
	
	this.selectedClear = function(){
		self.selectedParticipant('');
		self.availableClasses('');
		self.availableAttributes('');
	};
	
	this.setAttributesList = function(){
		self.availableAttributes(self.getAttributes(self.selectedParticipant().getParticipant().classOf));
		console.log('in atribute');
		console.log(self.availableAttributes());
	}
	
	this.getAttributes = function(className){
		var k = self.classHierarchy().filter(function(x){
			return x.name == className&&x!==undefined && x!= null
		});
		var result = null;
		if (k.length!=0){
			result = k[0].attributes.map(function(x){
				return x.name;
			});
		}
		return result;
	};
	
	this.makeParticipant = function(coordinate){
		var newParticipantVM = new ParticipantViewModel(self.RefreshEvent);
		newParticipantVM.id(coordinate.id);
		this.coordinates[this.coordinates.length] = coordinate;
		this.addParticipant(newParticipantVM);
    }
        
	this.addParticipant = function(newParticipant){
		this.participants.push(newParticipant);
	};

	this.makeParticipantFromModel = function(participant){
		var newParticipantVM = new ParticipantViewModel(self.RefreshEvent);
	}

	this.removeParticipant = function(id){
		for (var i=0;i<this.participants().length;i++)
			if (this.participants()[i].id()==id){
				for (var j=0; j<this.participants()[i].connections().length;j++){
					for (var k=0;k<this.participants().length;k++)
						if (this.participants()[k].id()==this.participants()[i].connections()[j])
							this.participants()[k].connections.remove(id);
				}
				this.participants.remove(this.participants()[i]);
				break;
			}
		for (var i = 0; i<this.coordinates.length; i++)
			if (this.coordinates[i].id==id){
				this.coordinates.splice(i,1);
				break;
			}
			this.selectedParticipant();
		};
		
	this.removeConnection = function(id1,id2){
		for (var i = 0; i <this.participants().length; i++)
			if (this.participants()[i].id()==id1)
				this.participants()[i].connections.remove(id2);
			else 
				if (this.participants()[i].id()==id2)
					this.participants()[i].connections.remove(id1);
	}

    this.setSituation = function(situation){
		self.participants.removeAll();
		this.name(situation.name);
		this.type(situation.type);
		this.description(situation.description);
		this.solution(situation.solution);
		this.coordinates = situation.coordinates;
		situation.participants.forEach(function(participant){
			var newParticipantVM = new ParticipantViewModel(self.RefreshEvent);
			newParticipantVM.setParticipant(participant);
			self.addParticipant(newParticipantVM);
		});
	};

	this.clear = function(){
		self.participants.removeAll();
		this.allConnections(0);
		this.name('');
		this.type('');
		this.description('');
		this.solution('');
		this.coordinates = [];
		this.selectedParticipant('');
	};

	this.getSituation = function(){
		var sit = new Object();
		sit.name = this.name();
		sit.type = this.type();
		sit.description = this.description();
		sit.solution = this.solution();
		sit.coordinates = this.coordinates;
		var lPars = [];
			this.participants().forEach(function(oPar){
				lPars[lPars.length] = oPar.getParticipant();
			});
		sit.participants = lPars;
		return sit;
	};

	this.Select = function(id){
		console.log('in select');
		self.selectedClear();
		for (var i=0;i<this.participants().length;i++)
			if (this.participants()[i].id()==id)
			{
				self.availableClasses(ko.utils.arrayMap(self.classHierarchy(), function(item){
					if (item.parent == self.participants()[i].getParticipant().purpose)
						return { name: item.name, value: item.name};
				}).filter(function(x) {return x!==undefined && x!= null;}));
				self.selectedParticipant(self.participants()[i]);
				self.selectedParticipant().classOf.subscribe(self.setAttributesList);
			}
	}
	
	this.AddConnectionBetween = function(id1,id2){
		this.participants().forEach(function(participant){
			if (participant.id() == id1)
				participant.connections.push(id2);
			if (participant.id() == id2)
				participant.connections.push(id1);
		});
		self.allConnections(self.allConnections()+1);
	}

	self.data = self.participants;
	self.AddRootNode = function(){
	    self.data.push(new SomeObject(self.data));
    };
	self.AddChildNode = function(){
		var data = this.tree.selectedNode().data;
		data.list.push(new SomeObject(data.list));
	};
	self.RemoveNode = function(){
		var data = self.tree.selectedNode().data;
		self.tree.selectedNode(null);
		data.collection.remove(data);
	};
	self.tree = new TreeView(self.data,{caption:'name', children: 'attributes'});
}