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
(function (exports) {
    exports.IsAjaxWrapperDebug = false;
    var debugAjaxWrapper = function () {
        if (exports.IsAjaxWrapperDebug) {
            console.log(arguments);
        }
    };
    // assumes the search/get starts immediately
    var AjaxWrapper = /** @class */ (function (_super) {
        __extends(AjaxWrapper, _super);
        function AjaxWrapper(props) {
            var _this = _super.call(this, props) || this;
            var state = { data: undefined, searchError: null, loading: true, urlChanged: false };
            _this.state = state;
            return _this;
        }
        AjaxWrapper.prototype.componentWillMount = function () {
            debugAjaxWrapper('AjaxWrapper: componentWillMount');
            this.sendSearch(this.props.getUrl);
            debugAjaxWrapper('AjaxWrapper: sendSearch completed');
        };
        AjaxWrapper.prototype.componentWillReceiveProps = function (nextProps) {
            var _this = this;
            debugAjaxWrapper('AjaxWrapper: componentWillReceiveProps');
            if (this.props.getUrl != nextProps.getUrl) {
                console.log('getUrl changed to ' + nextProps.getUrl);
                this.setState({ data: undefined, searchError: null, loading: true, urlChanged: true }, function () {
                    _this.sendSearch(nextProps.getUrl);
                });
            }
        };
        AjaxWrapper.prototype.onSearchFailed = function (searchText) {
            debugAjaxWrapper('AjaxWrapper: onSearchFailed');
            console.warn('ajax failed');
            this.setState({ data: undefined, searchError: 'failed to search for ' + searchText, loading: false });
        };
        // Event does not have a responseText property on the target property and EventTarget cannot be cast as XMLHttpRequestEventTarget
        // is evt really an Event?
        AjaxWrapper.prototype.onSearchResults = function (evt) {
            console.log('onSearchResults');
            exports.evt = evt;
            var t = evt.target;
            var model = JSON.parse(t.responseText);
            debugAjaxWrapper('AjaxWrapper: onSearchResults', model, evt);
            exports.target = evt.target;
            exports.searchResults = model;
            this.setState({ data: model, loading: false });
        };
        AjaxWrapper.prototype.sendSearch = function (url) {
            //fetch
            console.log('sendSearch', url);
            debugAjaxWrapper('AjaxWrapper :about to fetch', this.props, this.state);
            this.setState({ data: undefined, searchError: null, loading: true, urlChanged: false });
            console.log('cleared state');
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", this.onSearchResults.bind(this));
            oReq.addEventListener("error", this.onSearchFailed.bind(this));
            oReq.open("GET", url);
            oReq.send();
        };
        AjaxWrapper.prototype.render = function () {
            var props = this.props;
            var state = this.state;
            debugAjaxWrapper('AjaxWrapper: rendering', state);
            var rendering = props.render(state);
            debugAjaxWrapper('AjaxWrapper: rendering completed', rendering);
            return (rendering ? rendering : (<div>ajax wrapper failed to render</div>));
        };
        return AjaxWrapper;
    }(React.Component));
    AjaxWrapper.displayName = 'AjaxWrapper';
    // render the final results
    var AjaxRenderer = function (props) {
        try {
            exports.ajaxRendererProps = props;
            if (exports.isDefined(props.searchError) || (props.loading !== true && !exports.isDefined(props.data))) {
                debugAjaxWrapper("AjaxRenderer.Branch1", props);
                return (<div className="text-danger">{props.title} load failed</div>);
            }
            else if (props.loading === true) {
                debugAjaxWrapper("AjaxRenderer.Branch2", props);
                return (<div className="text-warning">Loading {props.title}...</div>);
            }
            else {
                debugAjaxWrapper("AjaxRenderer.Branch3", props);
                var result = props.renderData(props.data);
                if (result == null) {
                    console.error('renderer returned an invalid value', result, props.title);
                    return (<div>Error for {props.title}</div>);
                }
                return result;
            }
        }
        catch (ex) {
            console.error('ajax renderer exception', ex);
            return (<div />);
        }
    };
    AjaxRenderer.displayName = 'AjaxRenderer';
    // curry the renderer through the wait wrapper this is the only exported component
    var Ajax = function (props) {
        var renderGiftWrapping = function (state) {
            debugAjaxWrapper("Ajax.renderGiftWrapping", state);
            var result = (<AjaxRenderer title={props.title} loading={state.loading} data={state.data} renderData={props.renderData}/>);
            debugAjaxWrapper("Ajax.result", result);
            return result;
        };
        console.log('Ajax', props.getUrl);
        return (<AjaxWrapper getUrl={props.getUrl} render={renderGiftWrapping}/>);
    };
    Ajax.displayName = 'Ajax';
    exports.Ajax = Ajax;
})(findJsParent());
