"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="../node_modules/@types/react/index.d.ts" />
/// <reference types="react" />
(function (context) {
    var Ajax = context.Ajax;
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
    var TableDisplay = /** @class */ (function (_super) {
        __extends(TableDisplay, _super);
        function TableDisplay(props) {
            var _this = _super.call(this, props) || this;
            context.bindAllTheThings.call(_this, TableDisplay.prototype);
            _this.state = _this.getDefaultState();
            return _this;
        }
        TableDisplay.prototype.getDefaultState = function () {
            return { data: this.props.data, ajaxing: false };
        };
        TableDisplay.prototype.renderRefresh = function (data) {
            console.log('refresh loading', data);
            this.setState({ data: data, ajaxing: false });
        };
        TableDisplay.prototype.refresh = function () {
            console.log('refreshing');
            this.setState({ ajaxing: true });
        };
        TableDisplay.prototype.componentWillMount = function () {
            console.log('did mount');
        };
        TableDisplay.prototype.render = function () {
            console.log("rendering");
            if (this.state.ajaxing) {
                console.log('fetching!', context.historyUrl);
                context.fetch(context.historyUrl)
                    .then(function (response) { console.log('resp', response); return response.json(); })
                    .then(this.renderRefresh);
            }
            var middleWhere;
            if (!this.state.ajaxing && context.historyUrl != null)
                middleWhere = (<button onClick={this.refresh.bind(this)}>Refresh</button>);
            else if (context.historyUrl != null && this.state.ajaxing)
                middleWhere = <button disabled={true}>Refresh</button>;
            // (<Ajax title="fetching"
            //     getUrl={context.historyUrl}
            //     renderData={ajaxData => { this.renderRefresh(ajaxData); return <div />; }}
            // />)
            else
                <div>History refresh unavailable</div>;
            console.log('done creating where');
            return (<div>
                    <ProfileDisplay me={this.props.me}/>
                    {middleWhere}
                    <HistoryTable data={this.props.data}/>
                </div>);
        };
        return TableDisplay;
    }(React.Component));
    ReactDOM.render(
    // <HistoryTable data={context.data} />,
    <TableDisplay data={context.data} me={context.me}/>, document.getElementById('body'));
})(findJsParent());
