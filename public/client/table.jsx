"use strict";
/// <reference path="../node_modules/@types/react/index.d.ts" />
/// <reference types="react" />
(function (context) {
    context.appendedMap = false;
    var Marker = function (_a) {
        var data = _a.data;
        if (data == null || data.history == null)
            return <div>No history found!</div>;
        context.initMap = function () {
            console.log("map initializing");
            var center = { lat: 30.251183, lng: -81.590179 };
            var mapElement = document.getElementById('map');
            var map = new google.maps.Map(mapElement, {
                zoom: 4,
                center: center,
            });
            if (data.history.length == 0) {
                new google.maps.Marker({ position: { lat: 37.774900, lng: -122.419400 }, map: map, title: 'San Francisco' });
                new google.maps.Marker({ position: { lat: 30.251183, lng: -81.590179 }, map: map, title: 'Xpress' });
                new google.maps.Marker({ position: { lat: 30.32389185, lng: -81.3956847 }, map: map, title: 'SourceFuse' });
            }
            data.history
                .map(function (x) {
                new google.maps.Marker({ position: { lat: x.start_city.latitude, lng: x.start_city.longitude }, map: map, title: x.start_city.display_name });
            });
        };
        if (!context.appendedMap) {
            var script = document.createElement("script");
            script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDV3nmdg4uqjEstQI4v_tXaEXg0AdNwzfY&callback=initMap";
            script.defer = true;
            script.async = true;
            document.body.appendChild(script);
        }
        return (<div data-rendered="map">
            </div>);
    };
    var HistoryTable = function (_a) {
        var data = _a.data;
        if (data == null || data.history == null)
            return <div>No history found!</div>;
        else {
            return (<div>
                <table className="table is-bordered is-striped">
                    <thead>
                        <tr>
                            <th>Start</th>
                            <th>Display</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.history.map(function (hi) {
                return <tr key={hi.request_id}>
                                    <td>{new Date(hi.start_time).toLocaleDateString()}</td>
                                    <td>{hi.start_city.display_name}</td>
                                </tr>;
            })}
                    </tbody>
                </table>
                <Marker data={data}/>
            </div>);
        }
    };
    var ProfileDisplay = function (_a) {
        var me = _a.me;
        console.log('me', me);
        if (me == null)
            return <div />;
        return (<div>
            {me.last_name}, {me.first_name}
        </div>);
    };
    var TableDisplay = function (_a) {
        var me = _a.me, data = _a.data;
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        console.log('tableDisplay', me, data, rest);
        return (<div>
                <ProfileDisplay me={me}/>
                <HistoryTable data={data}/>
            </div>);
    };
    ReactDOM.render(
    // <HistoryTable data={context.data} />,
    <TableDisplay data={context.data} me={context.me}/>, document.getElementById('body'));
})(findJsParent());
