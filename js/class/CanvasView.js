function makeCanvasView(canvasId, MasterVM){
	function makeCounter(){
		var currentValue = 0;
		function counter() {
			return currentValue++;
        }
        counter.set = function(val){
            currentValue = val;
        };
        counter.reset = function(){
            currentValue = 0;
        };
		counter.getCurrent = function(){
			return currentValue;
		}
        return counter;
    };
	
	function makeNodesToRelation(){
		var selectedNodes = [];
		function nodesToRelation(){
			return selectedNodes;
		}
		nodesToRelation.set = function(element){
			if (!element.isElement)
				return;
			if (element == selectedNodes[0]){
				selectedNodes[0].item(0).stroke=MasterVM.configurationVM.notActiveParticipantColor();
				selectedNodes[0]=null;
				hypoLine.Remove();
				return;
			}
			if (element == selectedNodes[1]){
				selectedNodes[1].item(0).stroke=MasterVM.configurationVM.notActiveParticipantColor();
				selectedNodes[1]=null;
				hypoLine.Remove();
				return;
			}
			if ((selectedNodes[0]!=null) && (selectedNodes[1]!=null)){
				nodesToRelation.reset();
				selectedNodes[0] = element;
				selectedNodes[0].item(0).stroke = MasterVM.configurationVM.activeParticipantColor();
				return;
			}
			if (selectedNodes[0]==null) {
				selectedNodes[0] = element;
				selectedNodes[0].item(0).stroke = MasterVM.configurationVM.activeParticipantColor();
				if (selectedNodes[1]!=null){
					hypoLine.Create(selectedNodes[0],selectedNodes[1]);
				}
			} else {
				selectedNodes[1] = element;
				selectedNodes[1].item(0).stroke = MasterVM.configurationVM.activeParticipantColor();
				if (selectedNodes[0]!=null){
					hypoLine.Create(selectedNodes[0],selectedNodes[1]);
				}
			}
		}
		
		nodesToRelation.reset = function(){
			if (selectedNodes[0]){
				selectedNodes[0].item(0).stroke=MasterVM.configurationVM.notActiveParticipantColor();
				selectedNodes[0]=null;
			}
			if (selectedNodes[1]){
				selectedNodes[1].item(0).stroke=MasterVM.configurationVM.notActiveParticipantColor();
				selectedNodes[1]=null;
			}
			hypoLine.Remove();
		}
		nodesToRelation.clear = function(){
			selectedNodes[0]=null;
			selectedNodes[1]=null;
		}
		return nodesToRelation;
	}

	function makeHypoLine(){
		var currentHypoLine = new Object();
		var hl, hc;

		hypoLine = function(){
			return currentHypoLine;
		}

		hypoLine.Create = function(n1, n2) {
			if (!CheckConnect(n1,n2)) {
				hl = new fabric.Line( [n1.left,n1.top,n2.left,n2.top] , {
					isElement: 'hypo',
					fill: 'yellow',
					stroke: 'purple',
					strokeWidth: 0.5,
					selectable: false,
					dashed: true
				});
				currentCanvasView.add(hl);
				currentCanvasView.renderAll();
			} else  {
				nodesToRelation.reset();
				nodesToRelation.set(n2);
			}
				
		}

		hypoLine.Remove = function(){
			if (hl){
				hl.remove();
				hl = null;
			}
			currentCanvasView.renderAll();
		}

		hypoLine.IsCreated = function(){
			if (hl)
				return true;
			else
				return false;
		}

		function CheckConnect(n1,n2){
			var isConnected = false;
			currentCanvasView.getObjects().forEach(function(obj){
				if (obj.type=='line')
					if (((obj.id1==n1.id)&&(obj.id2==n2.id)) ||	((obj.id1==n2.id)&&(obj.id2==n1.id)))
						isConnected=true;
			});
			return isConnected;
		}

		return hypoLine;
	}

	var counter = makeCounter();
    var nodesToRelation = makeNodesToRelation();
	var hypoLine = makeHypoLine();
	
	canvasView.RemoveElementEvent = function(){
		if (currentCanvasView.getActiveObject()) 
			RemoveElement(currentCanvasView.getActiveObject());
		if (currentCanvasView.getActiveGroup())
			currentCanvasView.getActiveGroup().objects.forEach(function(element){
				RemoveElement(element);
			});
		canvasView.Refresh();
	}
	
	function RemoveElement(element){
		if (element.isElement) 
			MasterVM.situationVM.removeParticipant(element.id)
		else
			MasterVM.situationVM.removeConnection(element.id1,element.id2);
	}

	var currentCanvasId = canvasId;
	var currentCanvasView = new fabric.Canvas(currentCanvasId, {selection: true, hasControls:false, hasBorders:false, renderOnAddRemove:false});

	fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
	fabric.Group.prototype.hasControls = false;
	fabric.Group.prototype.hasControls = false;
	fabric.Group.prototype.lockMovementX = true;
	fabric.Group.prototype.lockMovementY = true;

	function AddNewRelationEvent(){
		canvasView.AddEdge(	{ x: nodesToRelation()[0].left, y : nodesToRelation()[0].top, id : nodesToRelation()[0].id },
							{ x: nodesToRelation()[1].left, y : nodesToRelation()[1].top, id : nodesToRelation()[1].id });
		MasterVM.situationVM.AddConnectionBetween(nodesToRelation()[0].id, nodesToRelation()[1].id);
		nodesToRelation.reset();
	}
	
	function AddNewParticipantEvent(target){
		var pos = currentCanvasView.getPointer(target);
		var coord = { x: pos.x, y : pos.y, id : counter() };
		MasterVM.situationVM.makeParticipant(coord);
		canvasView.AddNode(coord,'Undefined','');
	}
	
	function canvasView(){
		return currentCanvasView;
	}

	var isOnlyShow = false;
	
	canvasView.EnableFunctions = function(IsOnlyShow){
		isOnlyShow = IsOnlyShow;
		if (!isOnlyShow) {
			currentCanvasView.on('object:moving', function(e){ObjectMove(e);});
			currentCanvasView.on('mouse:down', function(options){OnHypoClick(options); console.log(options);});
			window.fabric.util.addListener(currentCanvasView.upperCanvasEl, 'dblclick', DoubleClickEvent);
			currentCanvasView.on('object:selected',function(options){SelectObject(options);});
			currentCanvasView.on('selection:created',function(options){CreateSelection(options);});
			currentCanvasView.on('before:selection:cleared', function(options){BeforeSelectionClear(options);});
		}
		else {
			
		}
	}
	
	function GetElementById(id){
		var res =  currentCanvasView.getObjects().filter(function(x){ console.log(x); return x.id==id;});
		console.log(res);
		return res;
	};
	
	function DoubleClickEvent(options){
		console.log(options);
		var pos = currentCanvasView.getPointer(options);
		var coord = { x: pos.x, y : pos.y, id : counter() };
		MasterVM.situationVM.makeParticipant(coord);
		canvasView.AddNode(coord,'Undefined','');
	}
	
	function AddVisualElement(vElement, front){
		currentCanvasView.add(vElement);
		if (front)
			currentCanvasView.getObjects()[currentCanvasView.getObjects().length-1].bringToFront()
		else
			currentCanvasView.getObjects()[currentCanvasView.getObjects().length-1].sendToBack();
	}

	function MakeNode(coordinate,purpose,name){
		var node = new fabric.Circle({
			strokeWidth: 4,
			radius: MasterVM.configurationVM.nodeRadius(),
			stroke: MasterVM.configurationVM.notActiveParticipantColor()
		});
		switch (purpose) {
			case 'Subject':
				node.fill =  MasterVM.configurationVM.subjectColor();
				break;
			case 'Process':
				node.fill =  MasterVM.configurationVM.processColor();
				break;
			case 'Relation':
				node.fill =  MasterVM.configurationVM.relationColor();
				break;
			default:
				node.fill =  MasterVM.configurationVM.undefinedColor();
				break;
		}
		if (isOnlyShow)
			node.lockMovementX = node.lockMovementY = true;
		if (!name)
			name='';
		var text = new fabric.Text(name, {
			fontSize: 20,
			originX: 'center',
			originY: 'center'
		});

		var newRadius = text.width/1.7;
		if (newRadius>MasterVM.configurationVM.nodeRadius()){
			node.scaleY = 0.75;
			node.radius = newRadius;
		}

		var group = new fabric.Group([ node, text ], {
			isElement: true,
			left: coordinate.x,
			top: coordinate.y,
			id: coordinate.id,
			lockMovementX : false,
			lockMovementY : false,
			hasControls : false,
			width : 2*node.getRadiusX(),
			height: 2*node.getRadiusY()
		});

		return group;
	}

	function MakeEdge(coord1,coord2){
		var edge =  new fabric.Line( [coord1.x,coord1.y,coord2.x,coord2.y] , {
			id1: coord1.id,
			id2: coord2.id,
			fill: MasterVM.configurationVM.notActiveConnectionColor(),
			stroke:  MasterVM.configurationVM.notActiveConnectionColor(),
			strokeWidth: MasterVM.configurationVM.strokeWidth(),
			perPixelTargetFind: true,
			lockMovementX: true,
			lockMovementY: true,
			hasControls: false
		});
		return edge;
	}

	canvasView.AddNode = function(coordinate,purpose,name){
		AddVisualElement(MakeNode(coordinate,purpose,name),true);
	}

	canvasView.AddEdge = function(coord1,coord2){
		AddVisualElement(MakeEdge(coord1,coord2),false);
	}

	canvasView.Refresh = function(){
		var tempParticipantId;
		if (MasterVM.situationVM.selectedParticipant()!='')
			tempParticipantId=MasterVM.situationVM.selectedParticipant().id();
		console.log(tempParticipantId);
		nodesToRelation.clear();
		currentCanvasView.clear();
		counter.reset();
		nodesToRelation.clear();
		if (MasterVM.situationVM){
			MasterVM.situationVM.coordinates.forEach(function(coordinate){
				var thisPurpose, thisName;
				for (var i=0; i<MasterVM.situationVM.participants().length; i++){
					if (MasterVM.situationVM.participants()[i].id()==coordinate.id){
						thisPurpose=MasterVM.situationVM.participants()[i].purpose();
						thisName=MasterVM.situationVM.participants()[i].name();
					}
				}
				canvasView.AddNode(coordinate,thisPurpose,thisName);
				if (coordinate.id>counter.getCurrent())
					counter.set(coordinate.id);
			});
			counter.set(counter.getCurrent()+1);
			MasterVM.situationVM.participants().forEach(function(participant){
				participant.connections().forEach(function(con){
					AddEdgeById(participant.id(),con);
				})
			});
		}
		if (tempParticipantId!=undefined)
		{
			MasterVM.selectedItems.removeAll();
			currentCanvasView.setActiveObject(GetElementById(tempParticipantId)[0]);
			MasterVM.situationVM.Select(tempParticipantId);
			nodesToRelation.set(GetElementById(tempParticipantId)[0]);
			//MasterVM.selectedItems.push(tempParticipantId);
			currentCanvasView.renderAll();
		}
	}

	
	
	
	var currentZoom = 1;
	canvasView.Zoom = function(value){
		function ZoomIt(factor){
			currentCanvasView.setZoom(factor);
			currentCanvasView.calcOffset();
			currentCanvasView.renderAll();
		}
		if (value>0)
			currentZoom += .1;
		else
			currentZoom -= .1;
		ZoomIt(currentZoom);
	}

	canvasView.Resize = function(){
		currentCanvasView.setHeight($('#'+currentCanvasId+'-view').height());
		currentCanvasView.setWidth($('#'+currentCanvasId+'-view').width());
		currentCanvasView.calcOffset();
		currentCanvasView.renderAll();
	}

	canvasView.MovePane = function(x,y){
		var delta = new fabric.Point(x, y);
		currentCanvasView.absolutePan(delta);
		currentCanvasView.calcOffset();
		currentCanvasView.renderAll();
	}

	
	function CheckConnect(n1,n2){
			var isConnected = false;
			currentCanvasView.getObjects().forEach(function(obj){
				if (obj.type=='line')
					if (((obj.id1==n1)&&(obj.id2==n2)) ||	((obj.id1==n2)&&(obj.id2==n1)))
						isConnected=true;
			});
			return isConnected;
	}
	
	function AddEdgeById(id1,id2){
		
		if (!CheckConnect(id1,id2)){
			MasterVM.situationVM.allConnections(MasterVM.situationVM.allConnections()+1);
			var coord1,coord2;
			MasterVM.situationVM.coordinates.forEach(function(coordinate){
				if (coordinate.id==id1)
					coord1=coordinate
				else
					if (coordinate.id==id2)
						coord2=coordinate;
			});
			AddVisualElement(MakeEdge(coord1,coord2),false);	
		}
	}

	function ObjectMove(e){
		if (hypoLine.IsCreated) 
			hypoLine.Remove();
		var p = e.target;
		if ((p.left)&&(p.top))
			MasterVM.situationVM.coordinates.forEach(function(coordinate){
				if (coordinate.id == p.id){
					coordinate.x = p.left;
					coordinate.y = p.top;
				}
			});
		for (var i in currentCanvasView.getObjects()) {
			if (currentCanvasView.getObjects()[i].type == 'line') {
				if (currentCanvasView.getObjects()[i].id1 == p.id)
					currentCanvasView.getObjects()[i].set({'x1':p.left,'y1':p.top});
				else
					if (currentCanvasView.getObjects()[i].id2 == p.id)
						currentCanvasView.getObjects()[i].set({'x2':p.left,'y2':p.top});
			}
		}
		currentCanvasView.setZoom(currentZoom);
	}
	
	function PaneMove(options){
		if (options.e.buttons==4){
			var delta = new fabric.Point(options.e.movementX, options.e.movementY);
			currentCanvasView.relativePan(delta);
			currentCanvasView.calcOffset();
			currentCanvasView.renderAll();
		}
	}
	
	currentCanvasView.on('mouse:move', function(options){PaneMove(options);});

	function OnHypoClick(options){
		if (options.e.which == 1){
			if (options.target) {
				if (options.target.isElement=='hypo'){
					AddNewRelationEvent();
					hypoLine.Remove();
					return;
				}
				nodesToRelation.set(options.target);
				currentCanvasView.renderAll();
			}
		}
	}
	
	function SelectObject(options){
		if (options.target.isElement){
			MasterVM.selectedItems.removeAll();
			MasterVM.selectedConnections.removeAll();
			MasterVM.selectedItems.push(options.target.id);
			MasterVM.situationVM.Select(options.target.id);
		}
		else {
			MasterVM.selectedItems.removeAll();
			MasterVM.selectedConnections.removeAll();
			MasterVM.selectedConnections.push(options.target.id);
		}
		if ((hypoLine.IsCreated)&&(!options.target.isElement))
			hypoLine.Remove();
	}
	
	
	
	function CreateSelection(options){
		MasterVM.selectedItems.removeAll();
		MasterVM.selectedConnections.removeAll();
		options.target.objects.forEach(function(obj){
			if (obj.isElement)
				MasterVM.selectedItems.push(obj);
			else 
				MasterVM.selectedConnections.push(obj);
		});
		if ((hypoLine.IsCreated)&&(!options.target.isElement))
			hypoLine.Remove();
	}
	
	function BeforeSelectionClear(options){
		if (!hypoLine.IsCreated()){
			nodesToRelation.reset();	
		}
		MasterVM.situationVM.selectedClear();
		MasterVM.selectedItems.removeAll();
		MasterVM.selectedConnections.removeAll();	
	}
	
	$(currentCanvasView.wrapperEl).on('mousewheel', function(options){
		canvasView.Zoom(options.originalEvent.wheelDelta);
		options.preventDefault();
	});

	canvasView.wheel = function(e){
		if (e.target.className !='upper-canvas')
			return;
		var area = e.target;
		var delta = e.deltaY || e.detail || e.wheelDelta;
		if ((delta < 0) && (area.scrollTop == 0))
			e.preventDefault();
		if ((delta>0)&&(area.scrollHeight - area.clientHeight - area.scrollTop <= 1))
			e.preventDefault();
		canvasView.Zoom(e.detail);
	}

	return canvasView;
}
