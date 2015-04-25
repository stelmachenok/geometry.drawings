/**
 * Drawings component.
 */
Drawings.GeomDrawComponent = {
    ext_lang: 'geometry_code',
    formats: ['format_geometry_json'],
    struct_support: true,
    factory: function (sandbox) {
        return new Drawings.GeomDrawWindow(sandbox);
    }
};
Drawings.GeomDrawWindow = function (sandbox) {
    this.sandbox = sandbox;
    this.model = new Drawings.Model();
    this.paintPanel = new Drawings.PaintPanel(this.sandbox.container, this.model);
    this.paintPanel.init();
    this.recieveData = function (data) {
        console.log("in recieve data" + data);
    };

    // element - point node
    function drawPointWithIdtf(element){
        window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
            element, sc_type_arc_common | sc_type_const,
            sc_type_link, sc_type_arc_pos_const_perm, self.keynodes.identifier]).done(function (res) {
            window.sctpClient.get_link_content(res[0][2], 'string').done(function (idtf) {
                console.log("update draw point");
                var point = new Drawings.Point((Math.random() - 0.5) * 15.0, (Math.random() - 0.5) * 15.0);
                point.name = idtf;
                self.model.addPoint(point);
                //adding sc-addr
                document.getElementById(self.model.paintPanel._getJxgObjectById(point.getId()).rendNode.id).setAttribute('sc_addr', element);
            });
        }).fail(function () {
            console.log("update draw point without idtf");
            var point = new Drawings.Point((Math.random() - 0.5) * 15.0, (Math.random() - 0.5) * 15.0);
            self.model.addPoint(point);
            //adding sc-addr
            document.getElementById(self.model.paintPanel._getJxgObjectById(point.getId()).rendNode.id).setAttribute('sc_addr', element);
        });
    }
// resolve keynodes
    var self = this;
    var scElements = {};
    this.needUpdate = false;
    this.requestUpdate = function () {
        var updateVisual = function () {
            for (var addr in scElements) {
                var obj = scElements[addr];
                if (!obj || obj.translated) continue;
// check if object is an arc
                if (obj.data.type & sc_type_arc_pos_const_perm) {
                    var begin = obj.data.begin;
                    var end = obj.data.end;
// if it connect point set and point, then create the last one
                    if (end && (begin == self.keynodes.point)) {
                        drawPointWithIdtf(end);
                        obj.translated = true;
                    } else if (end && (begin == self.keynodes.segment)) {
                        console.log("update draw segment");
                        var point1 = new Drawings.Point((Math.random() - 0.5) * 15.0, (Math.random() - 0.5) * 15.0);
                        var point2 = new Drawings.Point((Math.random() - 0.5) * 15.0, (Math.random() - 0.5) * 15.0);
                        var segment = new Drawings.Segment(point1, point2);
                        self.model.addPoint(point1);
                        self.model.addPoint(point2);
                        self.model.addShape(segment);
//adding sc-addr
                        document.getElementById(self.model.paintPanel._getJxgObjectById(segment.getId()).rendNode.id).setAttribute('sc_addr', end);
                        obj.translated = true;
                    } else if (end && (begin == self.keynodes.line)) {
                        console.log("update draw line");
                        var point1 = new Drawings.Point((Math.random() - 0.5) * 15.0, (Math.random() - 0.5) * 15.0);
                        var point2 = new Drawings.Point((Math.random() - 0.5) * 15.0, (Math.random() - 0.5) * 15.0);
                        var line = new Drawings.Line(point1, point2);
                        self.model.addPoint(point1);
                        self.model.addPoint(point2);
                        self.model.addShape(line);
//adding sc-addr
                        document.getElementById(self.model.paintPanel._getJxgObjectById(line.getId()).rendNode.id).setAttribute('sc_addr', end);
                        obj.translated = true;
                    } else if (end && (begin == self.keynodes.triangle)) {
                        console.log("update draw triangle");
                        var point1 = new Drawings.Point((Math.random() - 0.5) * 15.0, (Math.random() - 0.5) * 15.0);
                        var point2 = new Drawings.Point((Math.random() - 0.5) * 15.0, (Math.random() - 0.5) * 15.0);
                        var point3 = new Drawings.Point((Math.random() - 0.5) * 15.0, (Math.random() - 0.5) * 15.0);
                        var triangle = new Drawings.Triangle(point1, point2, point3);
                        self.model.addPoint(point1);
                        self.model.addPoint(point2);
                        self.model.addPoint(point3);
                        self.model.addShape(triangle);
//adding sc-addr
                        document.getElementById(self.model.paintPanel._getJxgObjectById(triangle.getId()).rendNode.id).setAttribute('sc_addr', end);
                        obj.translated = true;
                    } else if (end && (begin == self.keynodes.circle)) {
                        console.log("update draw circle");
                        var point1 = new Drawings.Point((Math.random() - 0.5) * 10.0, (Math.random() - 0.5) * 10.0);
                        var point2 = new Drawings.Point((Math.random() - 0.5) * 10.0, (Math.random() - 0.5) * 10.0);
                        var circle = new Drawings.Circle(point1, point2);
                        self.model.addPoint(point1);
                        self.model.addPoint(point2);
                        self.model.addShape(circle);
//adding sc-addr
                        document.getElementById(self.model.paintPanel._getJxgObjectById(circle.getId()).rendNode.id).setAttribute('sc_addr', end);
                        obj.translated = true;
                    }
                }
            }
/// @todo: Don't update if there are no new elements
            window.clearTimeout(self.structTimeout);
            delete self.structTimeout;
            if (self.needUpdate)
                self.requestUpdate();
        };
        self.needUpdate = true;
        if (!self.structTimeout) {
            self.needUpdate = false;
            self.structTimeout = window.setTimeout(updateVisual, 1000);
        }
    }
    this.keynodes = new Object();
    SCWeb.core.Server.resolveScAddr(['concept_geometric_point',
    ], function (keynodes) {
        self.keynodes.point = keynodes['concept_geometric_point'];
        self.needUpdate = true;
        self.requestUpdate();
    });
    SCWeb.core.Server.resolveScAddr(['concept_segment',
    ], function (keynodes) {
        self.keynodes.segment = keynodes['concept_segment'];
        self.needUpdate = true;
        self.requestUpdate();
    });
    SCWeb.core.Server.resolveScAddr(['concept_straight_line',
    ], function (keynodes) {
        self.keynodes.line = keynodes['concept_straight_line'];
        self.needUpdate = true;
        self.requestUpdate();
    });
    SCWeb.core.Server.resolveScAddr(['concept_triangle',
    ], function (keynodes) {
        self.keynodes.triangle = keynodes['concept_triangle'];
        self.needUpdate = true;
        self.requestUpdate();
    });
    SCWeb.core.Server.resolveScAddr(['concept_circle',
    ], function (keynodes) {
        self.keynodes.circle = keynodes['concept_circle'];
        self.needUpdate = true;
        self.requestUpdate();
    });
    SCWeb.core.Server.resolveScAddr(['nrel_system_identifier',
    ], function (keynodes) {
        self.keynodes.identifier = keynodes['nrel_system_identifier'];
        self.needUpdate = true;
        self.requestUpdate();
    });
    this.eventStructUpdate = function (added, element, arc) {
        window.sctpClient.get_arc(arc).done(function (r) {
            var addr = r[1];
            window.sctpClient.get_element_type(addr).done(function (t) {
                var type = t;
                var obj = new Object();
                obj.data = new Object();
                obj.data.type = type;
                obj.data.addr = addr;
                if (type & sc_type_arc_mask) {
                    window.sctpClient.get_arc(addr).done(function (a) {
                        obj.data.begin = a[0];
                        obj.data.end = a[1];
                        scElements[addr] = obj;
                        self.requestUpdate();
                    });
                }
            });
        });
    };
// delegate event handlers
    this.sandbox.eventDataAppend = $.proxy(this.receiveData, this);
    this.sandbox.eventStructUpdate = $.proxy(this.eventStructUpdate, this);
    this.sandbox.updateContent();
};
SCWeb.core.ComponentManager.appendComponentInitialize(Drawings.GeomDrawComponent);