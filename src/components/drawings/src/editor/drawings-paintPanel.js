/**
 * Paint panel.
 */

Drawings.PaintPanel = function (containerId, model) {
    this.containerId = containerId;

    this.model = model;

    this.controller = null;

    this.board = null;

    this.rendererMap = {};
};
Drawings.PaintPanel.paintObjects = [];
Drawings.PaintPanel.prototype = {

    init: function () {
        this._initMarkup(this.containerId);

        //this.board = this._createBoard();

        //this._configureModel();

        this.controller = new Drawings.Controller(this, this.model);

        this.rendererMap["Point"] = new Drawings.PointRenderer(this.board);
        this.rendererMap["Line"] = new Drawings.LineRenderer(this.board);
        this.rendererMap["Segment"] = new Drawings.SegmentRenderer(this.board);
        this.rendererMap["Triangle"] = new Drawings.TriangleRenderer(this.board);
        this.rendererMap["Polygon"] = new Drawings.PolygonRenderer(this.board);
        this.rendererMap["Circle"] = new Drawings.CircleRenderer(this.board);
        this.rendererMap["Angle"] = new Drawings.AngleRenderer(this.board);
    },

    getBoard: function () {
        return this.board;
    },

    getJxgObjects: function (event) {
        return this.board.getAllObjectsUnderMouse(event);
    },

    getJxgPoint: function (event) {
        var jxgObjects = this.getJxgObjects(event);

        var jxgPoints = jxgObjects.filter(function (jxgObject) {
            return jxgObject instanceof JXG.Point;
        });

        return jxgPoints.length > 0 ? jxgPoints[0] : null;
    },

    getMouseCoordinates: function (event) {
        var coordinates = this.board.getUsrCoordsOfMouse(event);
        return [coordinates[0], coordinates[1]];
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);
        var paintPanel = this;

        // root element
        container.append('<div id="geometryEditor" class="sc-no-default-cmd geometryEditor"></div>');
        var editor = $('#geometryEditor');

        SCWeb.core.Server.resolveScAddr(['ui_geometry_editor',
        ], function (keynodes) {
            editor.attr("sc_addr", keynodes['ui_geometry_editor']);
        });
        editor.append("<button type='button' id='applet2d' class='btn btn-success sc-no-default-cmd'>2D</button>");
        var applet2d = $('#applet2d');
        SCWeb.core.Server.resolveScAddr(['ui_applet2d',
            ], function (keynodes) {
                applet2d.attr("sc_addr", keynodes['ui_applet2d']);
        });
        editor.append("<button type='button' id='applet3d' class='btn btn-success sc-no-default-cmd'>3D</button>");
        var applet3d = $('#applet3d');
        SCWeb.core.Server.resolveScAddr(['ui_applet3d',
            ], function (keynodes) {
                applet3d.attr("sc_addr", keynodes['ui_applet3d']);
        });
        editor.append("<button type='button' id='synchronize' class='btn btn-success sc-no-default-cmd'>синхронизация</button>");
        var synchronize = $('#synchronize');
        SCWeb.core.Server.resolveScAddr(['ui_control_synchronization_button',
            ], function (keynodes) {
                synchronize.attr("sc_addr", keynodes['ui_control_synchronization_button']);
        });
        editor.append("<div id='applet_container'></div>");
        this._initGeometryApplet();
        var names = [];
        setTimeout(function() {
            var applet = document.ggbApplet;
            applet.registerAddListener('addObjectListener');
            applet.registerRemoveListener('removeObjectListener');
            applet.registerRenameListener('renameObjectListener');
            applet.registerUpdateListener('updateObjectListener');
        }, 8000);

       $('#synchronize').click(function () {
            if ($('#arguments_add_button').hasClass('btn btn-success argument-wait')) {
                return;
            }
            paintPanel._translate();
	});
    },

    _translate: function () {
	var objects = Drawings.PaintPanel.paintObjects;
	var paintPanel = this;
	objects.forEach(function(item, i, objects) {
		if (item.type === 'point') { 
			var point = new Drawings.Point(item.xCoord, item.yCoord);
			point.setName(item.name);
			paintPanel.model.addPoint(point);
		}
		else
		if (item.type === 'segment') {
            //console.log(item.name);
            var pointOneName = item.defenition.substring(item.defenition.indexOf("[")+1, item.defenition.indexOf(", "));
            var pointOne = paintPanel.model.getPointByName(pointOneName);
            if (pointOne == null)
                objects.forEach(function(item, i, objects) {
                    if (item.name == pointOneName){
                        pointOne = new Drawings.Point(item.xCoord, item.yCoord);
                        pointOne.setName(item.name);
                        paintPanel.model.addPoint(pointOne);
                    }
                });
            var pointTwoName = item.defenition.substring(item.defenition.indexOf(", ")+2, item.defenition.indexOf("]"));
            var pointTwo = paintPanel.model.getPointByName(pointTwoName);
            if (pointTwo == null)
                objects.forEach(function(item, i, objects) {
                    if (item.name == pointTwoName){
                        pointTwo = new Drawings.Point(item.xCoord, item.yCoord);
                        pointTwo.setName(item.name);
                        paintPanel.model.addPoint(pointTwo);
                    }
                });
            var segment = new Drawings.Segment(pointOne, pointTwo);
            segment.setLength(Math.sqrt(Math.pow(pointOne.x-pointTwo.x,2)+Math.pow(pointOne.y-pointTwo.y,2)));
            segment.name = Drawings.Utils.generateSegmentName(segment);
            paintPanel.model.addShape(segment);
            /*var segment = new Drawings.Segment(point, point);
            console.log("Segment, motherfucker!");
            point.setName(item.name);
            paintPanel.model.addPoint(point);*/
        }
 	});
        Drawings.ScTranslator.putModel(paintPanel.model);
     },

    _initGeometryApplet: function() {
        var parameters = {
            "id":"ggbApplet",
            "showToolBar":true,
            "borderColor":null,
            "showMenuBar":false,
            "showAlgebraInput":false,
            "showResetIcon":true,
            "showTutorialLink": false,
            "showLogging":true,
            "enableLabelDrags":true,
            "enableShiftDragZoom":true,
            "enableRightClick":true,
            "enableDialogActive":true,
            "capturingThreshold":null,
            "showToolBarHelp":false,
            "errorDialogsActive":true,
            "useBrowserForJS":true,
            "allowStyleBar":false};
        var applet = new GGBApplet(parameters, '5.0');

        applet.inject('applet_container');
        $('#applet2d').click(function(event) {
            ggbApplet.setPerspective('2');
            //ggbApplet.setLogging('true');
        });
        $('#applet3d').click(function() {
            ggbApplet.setPerspective('5');
        });
    }
};
function addObjectListener(objName) {
    var objects = this.Drawings.PaintPanel.paintObjects;
    var object = {
        'name': objName,
        'type': ggbApplet.getObjectType(objName),
        'xCoord': ggbApplet.getXcoord(objName),
        'yCoord': ggbApplet.getYcoord(objName),
        'zCoord': ggbApplet.getZcoord(objName),
        'value': ggbApplet.getValueString(objName),
        'defenition': ggbApplet.getDefinitionString(objName)
    };
    objects.splice(objects, 0, object);
    console.log(objects);
}
function removeObjectListener(objName) {
    var objects = this.Drawings.PaintPanel.paintObjects;
    objects.forEach(function(item, i, objects) {
        if (item.name === objName) {
            objects.splice(i, 1);
        }
    });
    console.log('objName', objects);
}
function renameObjectListener(oldObjName, newObjName) {
    var objects = this.Drawings.PaintPanel.paintObjects;
    objects.forEach(function(item, i, objects) {
        if (item.name === oldObjName) {
            item.name = newObjName;
        }
    });
    console.log('objName', objects);
}
function updateObjectListener(objName) {
    var objects = this.Drawings.PaintPanel.paintObjects;
    objects.forEach(function(item, i, objects) {
        if (item.name === objName) {
            item.type = ggbApplet.getObjectType(objName);
            item.xCoord = ggbApplet.getXcoord(objName);
            item.yCoord = ggbApplet.getYcoord(objName);
            item.zCoord = ggbApplet.getZcoord(objName);
            item.value = ggbApplet.getValueString(objName);
            item.defenition = ggbApplet.getDefinitionString(objName);
        }
    });
    console.log('objName', objects);
}
